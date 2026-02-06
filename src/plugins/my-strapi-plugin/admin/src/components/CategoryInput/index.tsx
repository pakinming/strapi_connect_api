// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
    MultiSelect,
    SingleSelect,
    SingleSelectOption,
    MultiSelectOption,
    Flex,
    Box,
    Field,
} from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';

const CategoryInput = ({ value, onChange, name, attribute, disabled, error, required }) => {
    const { get } = useFetchClient();
    const [categories, setCategories] = useState([]);
    const [childrenOptions, setChildrenOptions] = useState([]);
    const [isLoadingCats, setIsLoadingCats] = useState(false);
    const [isLoadingChildren, setIsLoadingChildren] = useState(false);

    // Parse value if needed, though Strapi usually passes object for JSON type
    const safeValue = value ? (typeof value === 'string' ? JSON.parse(value) : value) : { categoryId: null, childIds: [] };

    const [selectedCategory, setSelectedCategory] = useState(safeValue.categoryId);
    const [selectedChildren, setSelectedChildren] = useState(safeValue.childIds || []);

    // Fetch Categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCats(true);
            try {
                const { data } = await get('/content-manager/collection-types/api::category.category');
                const items = data.results || data.data || [];
                console.log('Categories:', items);
                setCategories(items);
            } catch (err) {
                console.error('Error fetching categories', err);
            } finally {
                setIsLoadingCats(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Children when Category changes
    useEffect(() => {
        const fetchChildren = async () => {
            if (!selectedCategory) {
                setChildrenOptions([]);
                return;
            }
            setIsLoadingChildren(true);
            try {
                // We use documentId for filtering in v5 usually, or id. Let's try documentId based on Schema.
                const { data } = await get(`/content-manager/collection-types/api::category-child.category-child?filters[category][documentId][$eq]=${selectedCategory}`);
                const items = data.results || data.data || [];
                setChildrenOptions(items);
            } catch (err) {
                console.error('Error fetching children', err);
            } finally {
                setIsLoadingChildren(false);
            }
        }
        fetchChildren();
    }, [selectedCategory]);

    const handleCategoryChange = (val) => {
        setSelectedCategory(val);
        setSelectedChildren([]); // Reset children

        // Update parent value
        const newVal = { categoryId: val, childIds: [] };
        // Usually for JSON field, we pass the object directly
        onChange({ target: { name, value: newVal, type: attribute.type } });
    };

    const handleChildrenChange = (val) => {
        setSelectedChildren(val);

        // Update parent value
        const newVal = { categoryId: selectedCategory, childIds: val };
        onChange({ target: { name, value: newVal, type: attribute.type } });
    };

    return (
        <Box>
            <Box paddingBottom={4}>
                <Field.Root name={name} id={name} error={error} hint={attribute.hint}>
                    <Flex direction="column" alignItems="stretch" gap={1}>
                        <Field.Label required={required}>{name}</Field.Label>

                        <Box paddingBottom={2} id="category-select">
                            <SingleSelect
                                label="Category"
                                placeholder="Select a category"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                disabled={disabled || isLoadingCats}
                            >
                                {categories.map(cat => (
                                    <SingleSelectOption key={cat.documentId} value={cat.documentId} >{cat.name}</SingleSelectOption>
                                ))}
                            </SingleSelect>
                        </Box>

                        <Box>
                            <MultiSelect
                                label="Category Children"
                                placeholder={selectedCategory ? "Select children..." : "Select a category first"}
                                value={selectedChildren}
                                onChange={handleChildrenChange}
                                withTags
                                disabled={disabled || !selectedCategory || isLoadingChildren}
                            >
                                {childrenOptions.map(child => (
                                    <MultiSelectOption key={child.documentId} value={child.documentId} >{child.name}</MultiSelectOption>
                                ))}
                            </MultiSelect>
                        </Box>

                        {error && <Field.Error />}
                        {attribute.hint && <Field.Hint />}
                    </Flex>
                </Field.Root>
            </Box>
        </Box>
    );
};

export default CategoryInput;
