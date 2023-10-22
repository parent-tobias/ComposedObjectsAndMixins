/****
 * A CharacterFactoryFactory, if you will. This takes a string, type,
 *  and returns a function that expects an initial state object.
 *  That then returns another function that expects any number of
 *  skill mixin functions.
 * The initialState is used to set up a state variable (and to do resets),
 *   and each skill mixin is run, connecting it to the local state.
 *   that gets stored in the 'abilities' variable.
 * Once that's done, we simply have the generic ClassCharacter getters,
 *   and any skill mixins, exposed on the return object.
 * 
 ****/

const ClassCharacter = (type)=> (...skills) => (initialState)  => (name) => {
  let state = {type, name, ...initialState};

  /****
   * the skills are the incoming mixins: canFight, canCast, canHeal,
   *   canDoSomething, and the abilities are the actual things 
   *   those mixins include: slash, fireball, healingHands, whatever
   * So we need to first wire the individual skill to the local
   *   instance of state, which creates a closure and returns an
   *   accessor object.
   ****/
  let abilities = skills.map((skill)=>skill(state));


    /****
     * Rather than requiring that the specific character class
     *   pass in a status function, we can iterate over the state
     *   object and define *dynamic* getters for each key in that
     *   state. Frankly, I'm surprised this works.
     ****/
    let status = (()=>{
      let statNames = Object.keys(state);
      return statNames.reduce((acc, key)=>{
        Object.defineProperty(acc, key, {get: ()=>state[key]});
        return acc;
      },{})
    })();

  return Object.assign(
    {
      status
    },
   ...abilities,
  );
}

/****
 * An example skill mixin. Passing this a state parameter connects it
 *  to some passed-in state object. Thus each function in the mixin can
 *  get or set values *on* that state, without knowing anything beyond
 *  itself.
 ****/
const canCast = (state) => ({
    cast: (spell) => {
        console.log(`${state.name} casts ${spell}!`);
        state.mana--;
    },
})

const canFight = (state) => ({
    fight: () => {
        console.log(`${state.name} slashes at the foe!`);
        state.stamina=state.stamina-1;
    },
    // get stamina(){return state.stamina;}
})

/****
 * Here, we actually create the Character Factories. A Fighter instance has the
 *  parameters:
 *  - type: 'Fighter',
 *  - initialState: <the passed object>
 *  - and canFight is its mixin.
 * 
 * A Paladin, on the other hand, gets *both* Fighter and Mage mixins.
 ****/

const Fighter =  ClassCharacter('fighter')(canFight);
const Mage = ClassCharacter('mage')(canCast)
const Paladin = ClassCharacter('paladin')(canCast, canFight);


// Finally, instances of the particular Character Factories!
let scorcher = Mage({health: 150, stamina: 100, mana: 120})('Scorcher')

scorcher.cast('fireball');    // Scorcher casts fireball!
console.log(scorcher.status.mana)    // 99

let slasher = Fighter({health: 150, stamina: 100})('Slasher')
slasher.fight();              // Slasher slashes at the foe!
console.log(slasher.status.stamina)  // 99

let pally = Paladin({health: 150, stamina:80, mana:100})("Holy Roller");
pally.fight();
pally.fight();
pally.cast("Ice storm");
pally.cast("Dante's Inferno");
console.log(Object.entries(pally.status) )
console.log(pally.status.health, pally.status.mana );