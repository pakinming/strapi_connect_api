const ds = require('@strapi/design-system');
console.log('Field type:', typeof ds.Field);
if (typeof ds.Field === 'object') {
  console.log('Field keys:', Object.keys(ds.Field));
}
console.log('SingleSelect type:', typeof ds.SingleSelect);
console.log('MultiSelect type:', typeof ds.MultiSelect);
console.log('Select type:', typeof ds.Select);
