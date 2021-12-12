import {
  CircuitValue,
  Field,
  PrivateKey,
  PublicKey,
  SmartContract,
  state,
  State,
  method,
  UInt64,
  Mina,
  Party,
  isReady,
  shutdown,
  prop,
} from 'snarkyjs';
import {MerkleTree} from "./merkleTree"; 

import { create, CID } from 'ipfs-http-client';

type voteDetails =  {
  threshold : number,
  yesVotes  : number,
  noVotes : number,
}
type token =  {
  owner : PublicKey,
  threshold : number,
  meta : string,
}


// Snapp to allow governance 
class Govern extends SmartContract {
 
  @state(PublicKey) admin : State<PublicKey>;
  @state(Field) votes : State<Field>;
  @state(Field) IPFSRoot1 : State<Field>
  @state(Field) IPFSRoot2 : State<Field>

  voteDetails : voteDetails;
  nullifierTree : MerkleTree<Field>;


  constructor(admin: PublicKey, proposalNumber: UInt64, meta: Field) {
    super(admin);

    this.admin = State.init(admin);
    this.votes = State.init(Field.zero);
    this.IPFSRoot1 = State.init(Field.zero);
    this.IPFSRoot2 = State.init(Field.zero);
    this.voteDetails = {threshold : 0,yesVotes:0,noVotes: 0};
    let emptyData : Field[]  = [Field.zero];
    this.nullifierTree = this.createMerkleTree(emptyData );
    }

  @method async vote() {
    // first check that user hasn't voted, for this we check for a nullifier in the merkle tree



    console.log("voted");
  }
  


    // range(n: number): Array<number> {
    //   let res = [];
    //   for (let i = 0; i < n; ++i) {
    //     res.push(i);
    //   }
    //   return res;
    // }

    @method async closeVote() {
    }


    // clear results and allow for new proposal number and meta data
    @method async reset(proposal: UInt64, meta: Field) {

    }
    
    createMerkleTree(data : Array<Field>) : MerkleTree<Field> {
      return new MerkleTree(data);
    }

    loadFromIPFS() : voteDetails {

    }

    checkForNullifier(voterAccount :PublicKey ) : boolean {
      return false;
    }

  }




export async function run() {
  await isReady;

  const Local = Mina.LocalBlockchain();
  Mina.setActiveInstance(Local);
  const account1 = Local.testAccounts[0].privateKey;
  const account2 = Local.testAccounts[1].privateKey;

  const adminPrivkey = PrivateKey.random();
  const adminPubkey = adminPrivkey.toPublicKey();

  let snappInstance: Govern;
  //const initSnappState = new Field(3);

  //upload to IPFS
  const ipfs = create({ host: '127.0.0.1', port: 5002 });
  let res = await ipfs.add(Buffer.from(JSON.stringify(dataToUpload)));
  // workaround to store it in a field element
  let rawCID = res.cid;

  let stringCID = rawCID.toString();
  console.log('CID: ', stringCID);

  let whitelistCID1 = rawCID.bytes;
  const view = new DataView(whitelistCID1.buffer);
  let uintOfCID = view.getUint32(0);
  console.log('CID as decimal ', uintOfCID);

  //tx param
  Poseidon.hash([Field(uintOfCID)])


  // smart contract below
  const view = new DataView(cid.bytes.buffer);
  let uintOfCID = view.getUint32(0);
  Poseidon.hash([Field(uintOfCID)])
    .equals(whiteListCID)
    .assertEquals(true);

    let whiteList = [];
    const ipfs = create({ host: '127.0.0.1', port: 5002 });
    for await (const file of ipfs.cat(cid)) {
      whiteList = JSON.parse(file.toString());
    }
  //
  // Deploys the snapp
  await Mina.transaction(account1, async () => {
    // account2 sends 1000000000 to the new snapp account
    const proposal = UInt64.fromNumber(10);
   // const admin = await Party.createSigned(account1);
   // p.balance.subInPlace(amount);

    snappInstance = new Govern(adminPubkey,  proposal);
  })
    .send()
    .wait();

  // Update the snapp
  await Mina.transaction(account1, async () => {

    // const fields = [];
    // fields[0] = new Field(3);
    // fields[1] = new Field(4);
    // await snappInstance.update(snappPubkey,snappPrivkey,snappPubkey,fields);
  })
    .send()
    .wait();

  //const a = await Mina.getAccount(snappPubkey);

  console.log('Govern');
  //console.log('final state value', a.snapp.appState[0].toString());
}

run();
shutdown();

// class TreeElements extends CircuitValue {
//   @prop publicKey: PublicKey;
//   @prop amount: UInt64;
//   constructor(publicKey: PublicKey, amount: UInt64) {
//     super();
//     this.publicKey = publicKey;
//     this.amount = amount;
//   }
//    xyz(): [TreeElements, Field][] {
//     return this;
//   }
// }