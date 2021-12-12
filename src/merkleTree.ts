export class MerkleTree<T> {

    data: Array<T>;



    constructor(data: Array<T>) {
        this.data = data;
    }

    addLeaf<T>(leaf: T): T {
        return leaf;
    }

    leafExists<T>(leaf: T): boolean {
        // search all leaves 
        return false;
    }
    getRoot() : T {
        this.rebuildTree();
        return this.data[0];
    }

    rebuildTree() {

    }
}

// type dataType {
//     secret String
//     nuiiifer  hash

// }