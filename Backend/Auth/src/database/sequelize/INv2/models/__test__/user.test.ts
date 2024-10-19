import { User } from "../User";

it(`implements optimistic concurrency control`, async()=>{
   const user = await User.create({
      firstName: 'Abbey',
      lastName: 'Wonder',
      email: 'abbey@wonder.com',
      phone: '+234706453533',
      password: "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b",
   });

   const firstInstance = await User.findByPk(user.id);
   const secondInstance = await User.findByPk(user.id);

   await firstInstance?.update({firstName: "Shola"});
   await secondInstance?.update({firstName: "Bade"});
});

it(`Increments the version number on update`, async()=>{
   const user = await User.create({
      firstName: 'Abbey',
      lastName: 'Wonder',
      email: 'abbey@wonder.com',
      phone: '+234706453533',
      password: "ecdb16de9e22e30877d96820140b0e91.89714cc2ad55373c717b53b4625a712b",
   });
   expect(user.version).toEqual(0);
   user.update({firstName: "Shola"});
   expect(user.version).toEqual(1);
});