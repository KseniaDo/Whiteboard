class TreeNode {
    coordinateValue = null;
    left = null;
    right = null;
    countRepeat = null;

    constructor(coordinateValue) {
        this.coordinateValue = coordinateValue;
        this.countRepeat = 1;
    }
}

export default class BinSearchTree {
    root = null;

    constructor() {
        this.root = null;
    }

    clear() {
        this.root = null;
    }

    insertCoordinate(coordinate) {
        this.root = this.insertInPlace(this.root, coordinate);
    }

    deleteCoordinate(coordinate) {
        this.root = this.deleteInPlace(this.root, coordinate);
    }

    getNewCorners() {
        const minValNode = this.getMin(this.root);
        const maxValNode = this.getMax(this.root);
        const [minVal, maxVal] = [minValNode.coordinateValue, maxValNode.coordinateValue]
        return [minVal, maxVal];
    }

    getMax(treeNode) {
        while (treeNode.right) {
            treeNode = treeNode.right;
        }

        return treeNode;
    }

    getMin(treeNode) {
        while (treeNode.left) {
            treeNode = treeNode.left;
        }

        return treeNode;
    }

    addDiffToVal(diff) {
        this.goPassTree(this.root, diff);
    }

    multiplyToVal(diff) {
        this.goPassTreeMultiply(this.root, diff);
    }

    goPassTree(treeNode, diff) {
        if (treeNode) {
            if (treeNode.right) {
                this.goPassTree(treeNode.right, diff);
            }
            treeNode.coordinateValue += diff;
            if (treeNode.left) {
                this.goPassTree(treeNode.left, diff);
            }
        }
    }

    goPassTreeMultiply(treeNode, diff) {
        if (treeNode) {
            if (treeNode.right) {
                this.goPassTreeMultiply(treeNode.right, diff);
            }
            treeNode.coordinateValue *= diff;
            if (treeNode.left) {
                this.goPassTreeMultiply(treeNode.left, diff);
            }
        }
    }

    insertInPlace(treeNode, coordinate) {
        if (!treeNode) {
            return new TreeNode(coordinate);
        }

        if (coordinate < treeNode.coordinateValue) {
            treeNode.left = this.insertInPlace(treeNode.left, coordinate);
        } else {
            if (coordinate > treeNode.coordinateValue) {
                treeNode.right = this.insertInPlace(treeNode.right, coordinate);
            } else {
                treeNode.countRepeat++;
            }
        }

        return treeNode;
    }

    deleteInPlace(treeNode, coordinate) {
        if (!treeNode) {
            return null;
        }

        if (coordinate < treeNode.coordinateValue) {
            treeNode.left = this.deleteInPlace(treeNode.left, coordinate);
        } else {
            if (coordinate > treeNode.coordinateValue) {
                treeNode.right = this.deleteInPlace(treeNode.right, coordinate);
            } else {
                if (treeNode.countRepeat > 1) {
                    treeNode.countRepeat--;
                    return treeNode;    
                }

                if ((!treeNode.left) && (!treeNode.right)) {
                    return null;
                }
                if (!treeNode.left) {
                    return treeNode.right;
                }
                if (!treeNode.right) {
                    return treeNode.left;
                }

                const MaxCoordinate = this.getMax(treeNode.left);
                treeNode.coordinateValue = MaxCoordinate.coordinateValue;
                treeNode.left = this.deleteInPlace(treeNode.left, MaxCoordinate.coordinateValue);
            }
        }
        return treeNode;
    }
}