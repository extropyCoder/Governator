import {
  Bool,
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
  Poseidon,
  Circuit,
  Signature,
} from 'snarkyjs';
import {MerkleTree} from "./merkleTree"; 

import {create, CID } from 'ipfs-http-client';

type voteDetails =  {
  threshold : number,
  yesVotes  : number,
  noVotes : number,
}



// Snapp to allow governance 
class Govern extends SmartContract {
 
  @state(PublicKey) admin : State<PublicKey>;
  @state(Field) votes : State<Field>;
  @state(Field) IPFSRoot1 : State<Field>
  @state(Field) IPFSRoot2 : State<Field>

  voteDetails : voteDetails;
  nullifierTree : MerkleTree<Field>;


  constructor(admin: PublicKey) {
    super(admin);

    this.admin = State.init(admin);
    this.votes = State.init(Field.zero);
    this.IPFSRoot1 = State.init(Field.zero);
    this.IPFSRoot2 = State.init(Field.zero);
    this.voteDetails = {threshold : 0,yesVotes:0,noVotes: 0 };
    let emptyData : Field[]  = [Field.zero];
    this.nullifierTree = this.createMerkleTree(emptyData);
    }

  @method async vote(voter: PublicKey, signature : Signature, vote : Field, cid : CID) {
    // first check that voter address belongs to the originator of the transaction
    signature.verify(voter, [vote]).assertEquals(true);
    // now check that user hasn't voted, for this we check for a nullifier in the merkle tree
    const hashOfAccount  = Poseidon.hash(voter.toFields());

    const exists = this.nullifierTree.leafExists(hashOfAccount)
    // if they have alreaady voted then throw error
    exists.assertEquals(false);
      
    Circuit.asProver(() => {
      console.log(hashOfAccount.toString());
    })
    // we add the hash of the account to the nullifier tree to indicate that this person voted
    this.updateMerkleTree([hashOfAccount]);
    // now update the vote details
      // load the vote details
      this.loadFromIPFS(cid);
    switch (vote) {
      // votes no
      case  Field.zero:
        this.voteDetails.noVotes ++;
      break;
      // votes yes
      case  Field.one:
        this.voteDetails.yesVotes ++;
        break;
    }
    // now store the vote details back on IPFS
  }
  


    @method async closeVote() {
    }


    // clear results and allow for new proposal number and meta data
    @method async reset(proposal: UInt64, meta: Field) {

    }
    
    createMerkleTree(data : Array<Field>) : MerkleTree<Field> {
      return new MerkleTree(data.length);
    }

    async updateMerkleTree(data : Field[]){
      this.nullifierTree.addLeaf(data);
      await this.storeInIPFS(this.nullifierTree);
    }

    async storeInIPFS(data : MerkleTree<Field>)  { 
      const ipfs = create({ host: '127.0.0.1', port: 5002 });
      let res = await ipfs.add(Buffer.from(JSON.stringify(data)));
      return res.cid;

    }

    async loadFromIPFS(cid : CID) {
      const ipfs = create({ host: '127.0.0.1', port: 5002 });
      for await (const file of ipfs.cat(cid)) {
        this.voteDetails = JSON.parse(file.toString());
      }
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

  const adminPrivkey = PrivateKey.random();
  const adminPubkey = adminPrivkey.toPublicKey();

  let snappInstance: Govern;
 
   // Deploys the snapp
  await Mina.transaction(account1, async () => {
    const proposal = UInt64.fromNumber(10);
    const admin = await Party.createSigned(account1);
    snappInstance = new Govern(adminPubkey);
  })
    .send()
    .wait();
}

run();
shutdown();

