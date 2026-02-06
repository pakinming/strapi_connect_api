import * as ds from '@strapi/design-system';

console.log('Field type:', typeof ds.Field);
if (typeof ds.Field === 'object') {
  console.log('Field keys:', Object.keys(ds.Field));
} else {
    console.log('Field is not an object, it is:', typeof ds.Field);
}

console.log('SingleSelect type:', typeof ds.SingleSelect);
if (typeof ds.SingleSelect === 'object') {
    console.log('SingleSelect keys:', Object.keys(ds.SingleSelect));
}

console.log('MultiSelect type:', typeof ds.MultiSelect);
if (typeof ds.MultiSelect === 'object') {
    console.log('MultiSelect keys:', Object.keys(ds.MultiSelect));
}
