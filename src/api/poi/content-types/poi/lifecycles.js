const { ApplicationError } = require('@strapi/utils').errors;

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    console.log('############ [Lifecycle] beforeCreate', data);
    await validateCategoryChildren(event, 'create');
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    console.log('############ [Lifecycle] beforeUpdate', data);
    await validateCategoryChildren(event, 'update');
  },
};

async function validateCategoryChildren(event, action) {
  console.log('############ [Lifecycle] Validating Category Children for action:', action);
  const { params } = event;
  const { data, where } = params;

  // 1. Resolve Effective Category POI
  let targetCategoryId = data.category_poi;
  // targetCategoryId can be:
  // - undefined: Not changed in this update
  // - null: Explicitly removed
  // - string/number: New ID/DocumentID

  let existingPoi = null;

  // For update, we need context of existing data to know the final state
  if (action === 'update') {
    if (where && where.documentId) {
      existingPoi = await strapi.documents('api::poi.poi').findOne({
        documentId: where.documentId,
        populate: ['category_poi', 'category_children']
      });
    }
  }

  // If category is not in payload (undefined), fallback to existing
  if (targetCategoryId === undefined && existingPoi && existingPoi.category_poi) {
    targetCategoryId = existingPoi.category_poi.documentId;
  }

  // 2. Resolve Children IDs to Check
  let idsToCheck = new Set();
  const childrenInput = data.category_children;
  const isCategoryChanging = data.category_poi !== undefined; // Changed if present (even if null)

  // Helper to extract IDs from input
  const extractIds = (input) => {
    const ids = new Set();
    if (!input) return ids;

    // Handle array (set) or object (connect/set)
    if (Array.isArray(input)) {
      input.forEach(item => ids.add(item.documentId || item));
    } else if (typeof input === 'object') {
       if (input.connect) {
         input.connect.forEach(item => ids.add(item.documentId || item));
       }
       if (input.set) {
         input.set.forEach(item => ids.add(item.documentId || item));
       }
    }
    return ids;
  };

  if (action === 'create') {
    idsToCheck = extractIds(childrenInput);
  } else {
    // Update Scenario
    if (isCategoryChanging) {
      console.log('[Lifecycle] Category is changing. Validating all effective children.');
      // 1. Start with existing children
      if (existingPoi && existingPoi.category_children) {
        existingPoi.category_children.forEach(c => idsToCheck.add(c.documentId));
      }
      
      // 2. Apply input changes
      if (childrenInput) {
          if (Array.isArray(childrenInput)) {
             // If array, it replaces everything? 
             // Strapi semantics for "data": array usually REPLACES for relations or triggers set.
             // But for safer logic, if it's an array, it's typically the new set.
             idsToCheck.clear();
             childrenInput.forEach(item => idsToCheck.add(item.documentId || item));
          } else {
             // Object with connect/disconnect
             if (childrenInput.disconnect) {
                childrenInput.disconnect.forEach(d => {
                   const idToRemove = d.documentId || d;
                   idsToCheck.delete(idToRemove);
                });
             }
             if (childrenInput.connect) {
                childrenInput.connect.forEach(c => idsToCheck.add(c.documentId || c));
             }
             if (childrenInput.set) {
                idsToCheck.clear();
                childrenInput.set.forEach(s => idsToCheck.add(s.documentId || s));
             }
          }
      }
      // Note: If childrenInput is undefined, we keep existing children as is.
      // But since Category CHANGED, we must re-validate them against new category.

    } else {
      // Category NOT changing.
      // We only strictly *need* to validate newly added children.
      // Existing children are assumed valid (unless we want to be paranoid and re-check all).
      // Optimization: Only check new ones.
      idsToCheck = extractIds(childrenInput);
    }
  }

  const finalIds = Array.from(idsToCheck);
  console.log('[Lifecycle] IDs to check:', finalIds);

  // If no children involved, return
  if (finalIds.length === 0) {
     return;
  }

  // If we have children but no Category (was null or set to null), Error.
  if (!targetCategoryId) {
      throw new ApplicationError("A Category must be selected if Category Children are assigned. Please select a Category or remove all Children.");
  }

  // 3. Verify Children against Target Category
  const children = await strapi.documents('api::category-child.category-child').findMany({
    filters: {
      documentId: {
        $in: finalIds
      }
    },
    populate: ['category']
  });

  for (const child of children) {
    const parentCategory = child.category;
    
    if (!parentCategory) {
       throw new ApplicationError(`Child category "${child.name}" has no parent category. Cannot assign to the selected Category.`);
    }

    // Check match
    const isMatch = (parentCategory.documentId === targetCategoryId);
    
    if (!isMatch) {
       throw new ApplicationError(
         `Invalid selection: Child "${child.name}" belongs to category "${parentCategory.name}". It does not match the selected POI Category.`
       );
    }
  }
}
