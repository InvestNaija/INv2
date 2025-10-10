/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

export enum EValidatorType {
   createCustomer= 'createCustomer',
   customerUpdate = 'customerUpdate',
   customerUpdateBankAcc = 'customerUpdateBankAcc'
}
class Dto {
   declare id: number;
   declare foo: string;
   declare bar: string;
   declare active: boolean;
   declare validatorType?: EValidatorType;
}

const post: Dto = {
   id: 1,
   foo: 'Bimbs',
   bar: 'Bard',
   active: true
};
console.log(Object.keys(post));
console.log('Abimbs');

const toDelete = ['active', 'bar'];
toDelete.forEach(key => delete (post as { [key: string]: any })[key]);
console.log('here');
