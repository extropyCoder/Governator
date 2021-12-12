# Governator
Governance snapp allowing voting on proposals to be used as a gevernance mechanism.
Currently the snapp is created for a particular proposal and allows users to vote on the proposal, IPfs is used to store vote details, a merkel tree that holds nullifiers to prevent one account voting twice and meta data about the proposal.
Further developments will 
- use the snarkyjs data store 
- allow governance tokens, so that one account can have a weighted vote
- multiple proposals per snapp, so the snapp need only be created once per project
- a DAO like funding mechanism so that succesful proposals can receive funding from the snapp 