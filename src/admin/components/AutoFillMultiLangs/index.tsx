// @ts-nocheck
import React, { useEffect, useRef, useCallback } from 'react';
import { useFetchClient, useForm, useField } from '@strapi/strapi/admin';
import { generateNKeysBetween } from 'fractional-indexing';

// Configuration for supported content types
const CONTENT_TYPE_CONFIGS = [
    {
        pathMatch: 'api::select-default-multi-lang.select-default-multi-lang',
        apiEndpoint: '/api/select-default-multi-langs/localized-relations',
        relationFieldName: 'multi_langs', // The form field name for the relation
        mainFieldName: 'data',            // The main display field on the related entity
    },
    {
        pathMatch: 'api::select-tag.select-tag',
        apiEndpoint: '/api/select-tags/localized-relations',
        relationFieldName: 'tags',        // The form field name for the relation
        mainFieldName: 'tag_name',        // The main display field on the related entity
    },
];

/**
 * AutoFillMultiLangs
 *
 * This component injects into the Strapi admin panel's editView.
 * When the user switches to a non-English locale, it calls the custom API
 * to fetch the localized relations and populates the relation field directly
 * via Strapi's internal Form API — no DOM manipulation needed.
 */
const AutoFillMultiLangs: React.FC = () => {
    const { get } = useFetchClient();

    // Access form state methods from Strapi's Form context
    const formValues = useForm('AutoFillMultiLangs', (state) => state.values);
    const formOnChange = useForm('AutoFillMultiLangs', (state) => state.onChange);

    const lastStateRef = useRef<{ locale: string | null; docId: string | null; path: string | null }>({
        locale: null,
        docId: null,
        path: null,
    });
    const processingRef = useRef(false);

    const tryAutoFill = useCallback(async () => {
        const currentPath = window.location.pathname;

        // Find matching config for current content type
        const config = CONTENT_TYPE_CONFIGS.find(c => currentPath.includes(c.pathMatch));

        if (!config) {
            return;
        }

        // Parse locale from URL query params
        let currentLocale: string | null = null;
        const urlParams = new URLSearchParams(window.location.search);
        const urlLocale = urlParams.get('plugins[i18n][locale]');
        if (urlLocale) {
            currentLocale = urlLocale;
        }

        // Fallback: try locale from the locale selector button in DOM
        if (!currentLocale) {
            const localeButton = document.querySelector('[data-testid="locale-select"]') as HTMLElement;
            if (localeButton) {
                const text = localeButton.textContent || '';
                if (text.includes('th-TH') || text.includes('Thai')) {
                    currentLocale = 'th-TH';
                } else if (text.includes('en') || text.includes('English')) {
                    currentLocale = 'en';
                }
            }
        }

        // Extract documentId from URL path
        const contentTypeRegex = new RegExp(`${config.pathMatch.replace(/\./g, '\\.')}\\/([a-zA-Z0-9]+)`);
        const docIdMatch = currentPath.match(contentTypeRegex);
        const currentDocId = docIdMatch ? docIdMatch[1] : null;

        // Only process if locale is non-English and we have a documentId
        if (!currentDocId || !currentLocale || currentLocale === 'en') {
            lastStateRef.current = { locale: currentLocale, docId: currentDocId, path: currentPath };
            return;
        }

        // Skip if same state as last check
        if (
            currentLocale === lastStateRef.current.locale &&
            currentDocId === lastStateRef.current.docId &&
            currentPath === lastStateRef.current.path
        ) {
            return;
        }

        // Avoid duplicate processing
        if (processingRef.current) return;
        processingRef.current = true;

        lastStateRef.current = { locale: currentLocale, docId: currentDocId, path: currentPath };

        try {
            // Check if the relation field already has data in the form state
            const fieldName = config.relationFieldName;
            const fieldValue = formValues?.[fieldName];

            // If there are already connected relations, skip
            if (fieldValue?.connect && fieldValue.connect.length > 0) {
                console.log(`[AutoFillMultiLangs] Relations already connected for ${fieldName}, skipping.`);
                processingRef.current = false;
                return;
            }

            console.log(`[AutoFillMultiLangs] Fetching localized relations for doc=${currentDocId}, locale=${currentLocale}, type=${config.pathMatch}`);

            const response = await get(
                `${config.apiEndpoint}?documentId=${currentDocId}&targetLocale=${currentLocale}`
            );

            const relations = response?.data?.data || [];
            console.log('[AutoFillMultiLangs] Received relations:', relations);

            if (relations.length > 0) {
                // Build the connect array in the format Strapi's form expects
                // Each item needs: id, apiData, __temp_key__, label, [mainField]
                const existingConnect = fieldValue?.connect ?? [];
                let lastKey: string | null = null;

                // Get the last key from existing connects (if any)
                if (existingConnect.length > 0) {
                    lastKey = existingConnect[existingConnect.length - 1]?.__temp_key__ ?? null;
                }

                // Generate keys for all new relations at once
                const keys = generateNKeysBetween(lastKey, null, relations.length);

                const connectItems = relations.map((rel: any, index: number) => ({
                    id: rel.id,
                    apiData: {
                        id: rel.id,
                        documentId: rel.documentId,
                        locale: rel.locale,
                        isTemporary: true,
                    },
                    status: rel.publishedAt ? 'published' : 'draft',
                    __temp_key__: keys[index],
                    // Set the main field value for display
                    [config.mainFieldName]: rel[config.mainFieldName],
                    label: rel[config.mainFieldName] || rel.documentId,
                    href: `../collection-types/${config.pathMatch.replace('api::', '').replace(/\./g, '::')}/${rel.documentId}?plugins[i18n][locale]=${rel.locale || currentLocale}`,
                }));

                // Set the connect array on the form field
                const newConnect = [...existingConnect, ...connectItems];
                formOnChange(`${fieldName}.connect`, newConnect);

                console.log(`[AutoFillMultiLangs] Successfully connected ${connectItems.length} relation(s) to ${fieldName} via Form API.`);
            }
        } catch (error) {
            console.error('[AutoFillMultiLangs] Error:', error);
        } finally {
            processingRef.current = false;
        }
    }, [get, formValues, formOnChange]);

    useEffect(() => {
        // Monitor URL changes and DOM updates using interval
        const interval = setInterval(tryAutoFill, 2000);

        // Also listen for URL changes (popstate for back/forward, custom for pushState)
        const handleUrlChange = () => {
            setTimeout(tryAutoFill, 500);
        };

        window.addEventListener('popstate', handleUrlChange);

        // Override pushState/replaceState to detect SPA navigation
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            handleUrlChange();
        };

        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            handleUrlChange();
        };

        return () => {
            clearInterval(interval);
            window.removeEventListener('popstate', handleUrlChange);
            history.pushState = originalPushState;
            history.replaceState = originalReplaceState;
        };
    }, [tryAutoFill]);

    // This component renders nothing visible
    return null;
};

export default AutoFillMultiLangs;
