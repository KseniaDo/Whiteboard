import { BitmapText, Container, Graphics, Rectangle } from 'pixi.js';
import BinSearchTree from './binSearchTree';

export default class OuterContainer {
    leftUpCornerX = null;
    leftUpCornerY = null;
    rightDownCornerX = null;
    rightDownCornerY = null;
    width = null;
    height = null;
    elementsIds = [];
    owner = null;
    type = null;
    container = new Container();
    containerOffset = 64;
    containerStroke = new Graphics();
    controlLeftUp = new Graphics();
    controlLeftDown = new Graphics();
    controlRightUp = new Graphics();
    controlRightDown = new Graphics();
    xCoordinates = new BinSearchTree();
    yCoordinates = new BinSearchTree();
    lastCornerChangeX = null;
    lastCornerChangeY = null;

    constructor () {
        this.setControls();
        this.container.sortableChildren = true;
        this.container.label = "outerContainer";
    }

    setControls () {
        if (this.controlLeftUp.destroyed) {
            this.controlLeftUp = new Graphics();
        }
        if (this.controlLeftDown.destroyed) {
            this.controlLeftDown = new Graphics();
        }
        if (this.controlRightUp.destroyed) {
            this.controlRightUp = new Graphics();
        }
        if (this.controlRightDown.destroyed) {
            this.controlRightDown = new Graphics();
        }
        this.controlLeftUp.rect(this.containerOffset / 2 - 4, this.containerOffset / 2 - 4, 8, 8);
        this.controlLeftUp.zIndex = 2;
        this.controlLeftUp.label = "LeftUp";
        this.controlLeftDown.rect(this.containerOffset / 2 - 4, this.containerOffset / 2 - 4, 8, 8);
        this.controlLeftDown.zIndex = 2;
        this.controlLeftDown.label = "LeftDown";
        this.controlRightUp.rect(this.containerOffset / 2 - 4, this.containerOffset / 2 - 4, 8, 8);
        this.controlRightUp.zIndex = 2;
        this.controlRightUp.label = "RightDown";
        this.controlRightDown.rect(this.containerOffset / 2 - 4, this.containerOffset / 2 - 4, 8, 8);
        this.controlRightDown.zIndex = 2;
        this.controlRightDown.label = "RightUp";
        this.containerStroke.zIndex = 2;
    }

    setStroke () {
        if (this.containerStroke.destroyed) {
            this.containerStroke = new Graphics();
        } else {
            this.containerStroke.clear();
        }
        const strokeWidth = Math.abs(this.rightDownCornerX - this.leftUpCornerX);
        const strokeHeight = Math.abs(this.rightDownCornerY - this.leftUpCornerY);
        this.containerStroke.rect(
            this.containerOffset / 2,
            this.containerOffset / 2,
            strokeWidth,
            strokeHeight
        )
    }

    addCoordinates (elementCoordinateX, elementCoordinateY) {
        this.xCoordinates.insertCoordinate(elementCoordinateX);
        this.yCoordinates.insertCoordinate(elementCoordinateY);
    }

    setNewCorners () {
        const [minValX, maxValX] = this.xCoordinates.getNewCorners();
        const [minValY, maxValY] = this.yCoordinates.getNewCorners();

        this.leftUpCornerX = minValX;
        this.leftUpCornerY = minValY;

        this.rightDownCornerX = maxValX;
        this.rightDownCornerY = maxValY;

        this.width = this.rightDownCornerX - this.leftUpCornerX;
        this.height = this.rightDownCornerY - this.leftUpCornerY;

        this.setPositionsControl();
    }
    
    addElement (stageElement) {
        this.container.removeChild(this.containerStroke, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        let oldCornerX = this.leftUpCornerX;
        let oldCornerY = this.leftUpCornerY;

        if (this.leftUpCornerX == null) {
            this.leftUpCornerX = stageElement.leftUpCornerX;
            this.leftUpCornerY = stageElement.leftUpCornerY;
            this.rightDownCornerX = stageElement.rightDownCornerX;
            this.rightDownCornerY = stageElement.rightDownCornerY;
        } else {
            this.leftUpCornerX = (stageElement.leftUpCornerX < this.leftUpCornerX) ? stageElement.leftUpCornerX : this.leftUpCornerX;
            this.leftUpCornerY = (stageElement.leftUpCornerY < this.leftUpCornerY) ? stageElement.leftUpCornerY : this.leftUpCornerY;
            this.rightDownCornerX = (stageElement.rightDownCornerX > this.rightDownCornerX) ? stageElement.rightDownCornerX : this.rightDownCornerX;
            this.rightDownCornerY = (stageElement.rightDownCornerY > this.rightDownCornerY) ? stageElement.rightDownCornerY : this.rightDownCornerY;
        }

        this.container.children.forEach((child) => {
            child.position.x += oldCornerX - this.leftUpCornerX;
            child.position.y += oldCornerY - this.leftUpCornerY;
        })

        this.xCoordinates.insertCoordinate(stageElement.leftUpCornerX);
        this.xCoordinates.insertCoordinate(stageElement.rightDownCornerX);
        this.yCoordinates.insertCoordinate(stageElement.leftUpCornerY);
        this.yCoordinates.insertCoordinate(stageElement.rightDownCornerY);

        this.width = this.rightDownCornerX - this.leftUpCornerX;
        this.height = this.rightDownCornerY - this.leftUpCornerY;

        this.setStroke();
        stageElement.elementGraphics.label = "selectedElement";
        stageElement.elementGraphics.zIndex = 1;
        this.container.addChild(stageElement.elementGraphics);
        if (stageElement.elementType == 'rect' && stageElement.allowText) {
            stageElement.setPositionTextGraphics(this.leftUpCornerX, this.leftUpCornerY);
            stageElement.elementTextGraphics.zIndex = 2;
            stageElement.elementTextGraphics.text = stageElement.elementTextString;
            stageElement.elementTextGraphics.style = {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFF0000,
                wordWrap: true,
                wordWrapWidth: stageElement.rightDownCornerX - stageElement.leftUpCornerX - stageElement.textMargin,
                align: 'left',
            }
            this.container.addChild(stageElement.elementTextGraphics);
        }

        this.setControlPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setControlPositions(this.controlLeftDown, - this.containerOffset / 2, this.height - this.containerOffset / 2);
        this.setControlPositions(this.controlRightUp, this.width - this.containerOffset / 2, this.height - this.containerOffset / 2);
        this.setControlPositions(this.controlRightDown, this.width - this.containerOffset / 2, - this.containerOffset / 2);
        this.setControlPositions(this.containerStroke, - this.containerOffset / 2, - this.containerOffset / 2);
        this.container.addChild(this.containerStroke, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        this.container.interactive = true;
        this.container.position.x = this.leftUpCornerX;
        this.container.position.y = this.leftUpCornerY;
    }

    removeElement (stageElement) {
        this.container.removeChild(stageElement);
    }

    removeCoordinates (selectedElement) {
        this.container.removeChild(this.containerStroke, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        this.xCoordinates.deleteCoordinate(selectedElement.leftUpCornerX);
        this.xCoordinates.deleteCoordinate(selectedElement.rightDownCornerX);

        this.yCoordinates.deleteCoordinate(selectedElement.leftUpCornerY);
        this.yCoordinates.deleteCoordinate(selectedElement.rightDownCornerY);

        let oldCornerX = this.leftUpCornerX;
        let oldCornerY = this.leftUpCornerY;

        const [minValX, maxValX] = this.xCoordinates.getNewCorners();
        const [minValY, maxValY] = this.yCoordinates.getNewCorners();

        this.leftUpCornerX = minValX;
        this.leftUpCornerY = minValY;
        this.rightDownCornerX = maxValX;
        this.rightDownCornerY = maxValY;

        this.container.children.forEach((child) => {
            child.position.x += oldCornerX - this.leftUpCornerX;
            child.position.y += oldCornerY - this.leftUpCornerY;
        })

        this.width = this.rightDownCornerX - this.leftUpCornerX;
        this.height = this.rightDownCornerY - this.leftUpCornerY;

        this.setStroke();

        this.setControlPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setControlPositions(this.controlLeftDown, - this.containerOffset / 2, this.height - this.containerOffset / 2);
        this.setControlPositions(this.controlRightUp, this.width - this.containerOffset / 2, this.height - this.containerOffset / 2);
        this.setControlPositions(this.controlRightDown, this.width - this.containerOffset / 2, - this.containerOffset / 2);
        this.setControlPositions(this.containerStroke, - this.containerOffset / 2, - this.containerOffset / 2);
        this.container.addChild(this.containerStroke, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        this.container.interactive = true;
        this.container.position.x = this.leftUpCornerX;
        this.container.position.y = this.leftUpCornerY;
    }

    fillControlElements () {
        this.controlLeftUp.fill({color: 0x93D2FF});
        this.controlLeftDown.fill({color: 0x93D2FF});
        this.controlRightUp.fill({color: 0x93D2FF});
        this.controlRightDown.fill({color: 0x93D2FF});

        this.container.children.forEach((child) => {
            if (!(child instanceof BitmapText)) {
                child.stroke({ width: 2, color: 0x0095FF });
            }
        })
    }

    setContainerPosition (final, DiffX, DiffY) {
        if (final) {
            this.xCoordinates.addDiffToVal(DiffX);
            this.yCoordinates.addDiffToVal(DiffY);
            this.lastCornerChangeX = DiffX;
            this.lastCornerChangeY = DiffY;
        }
        this.setControlPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setControlPositions(this.controlLeftDown, - this.containerOffset / 2, this.height - this.containerOffset / 2);
        this.setControlPositions(this.controlRightUp, this.width - this.containerOffset / 2, this.height - this.containerOffset / 2);
        this.setControlPositions(this.controlRightDown, this.width - this.containerOffset / 2, - this.containerOffset / 2);
        this.setControlPositions(this.containerStroke, - this.containerOffset / 2, - this.containerOffset / 2);
        this.container.position.x = this.leftUpCornerX;
        this.container.position.y = this.leftUpCornerY;
    }

    setContainerScale (final, ScaleX, ScaleY, diffCornerX, diffCornerY) {
        this.width = this.rightDownCornerX - this.leftUpCornerX;
        this.height = this.rightDownCornerY - this.leftUpCornerY;

        if (final) {
            this.lastScaleX = ScaleX;
            this.lastScaleY = ScaleY;
            this.lastCornerChangeX = diffCornerX;
            this.lastCornerChangeY = diffCornerY;
        }

        let containerControlScaleX = ScaleX;
        let containerControlScaleY = ScaleY;

        this.setStroke();
        this.containerStroke.stroke({ width: 2, color: 0x0095FF });
        [
            this.controlLeftUp, 
            this.controlLeftDown, 
            this.controlRightUp, 
            this.controlRightDown
        ].forEach((element) => {
            this.setControlScale(element, containerControlScaleX, containerControlScaleY);
        })

        if (this.leftUpCornerX > this.rightDownCornerX) {
            containerControlScaleX = - ScaleX;
        }
        if (this.leftUpCornerY > this.rightDownCornerY) {
            containerControlScaleY = - ScaleY;
        }
        this.setControlScale(this.containerStroke, containerControlScaleX, containerControlScaleY);

        if ((this.leftUpCornerX > this.rightDownCornerX) || (this.leftUpCornerY > this.rightDownCornerY)) {
            this.setControlPositions(this.containerStroke, (- this.containerOffset / 2) / containerControlScaleX, (- this.containerOffset / 2) / containerControlScaleY);
        } else {
            this.setControlPositions(this.containerStroke, (- this.containerOffset / 2) / ScaleX, (- this.containerOffset / 2) / ScaleY);
        }

        this.setControlPositions(this.controlLeftUp, - this.containerOffset / 2 / ScaleX, - this.containerOffset / 2 / ScaleY);
        this.setControlPositions(this.controlLeftDown, (- this.containerOffset / 2) / ScaleX, (this.height - this.containerOffset / 2) / ScaleY);
        this.setControlPositions(this.controlRightUp, (this.width - this.containerOffset / 2) / ScaleX, (this.height - this.containerOffset / 2) / ScaleY);
        this.setControlPositions(this.controlRightDown, (this.width - this.containerOffset / 2) / ScaleX, (- this.containerOffset / 2) / ScaleY);
        this.container.position.x = this.leftUpCornerX;
        this.container.position.y = this.leftUpCornerY;
        this.container.hitArea = new Rectangle(-4, -4, this.width + 8, this.height + 8);
    }

    setPositionsControl () {
        this.setControlPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setControlPositions(this.controlLeftDown, (- this.containerOffset / 2), (this.height - this.containerOffset / 2));
        this.setControlPositions(this.controlRightUp, (this.width - this.containerOffset / 2), (this.height - this.containerOffset / 2));
        this.setControlPositions(this.controlRightDown, (this.width - this.containerOffset / 2), (- this.containerOffset / 2));
        this.setControlPositions(this.containerStroke, (- this.containerOffset / 2), (- this.containerOffset / 2));
        this.container.position.x = this.leftUpCornerX;
        this.container.position.y = this.leftUpCornerY;
    }

    setChildElementsScale (scaleX, scaleY) {
        this.setStroke();
        this.containerStroke.stroke({ width: 2, color: 0x0095FF });

        [
            this.controlLeftUp, 
            this.controlLeftDown, 
            this.controlRightUp, 
            this.controlRightDown,
            this.containerStroke
        ].forEach((element) => {
            this.setControlScale(element, scaleX, scaleY);
        })

        this.setControlPositions(this.controlLeftUp, - this.containerOffset / 2 / scaleX, - this.containerOffset / 2 / scaleY);
        this.setControlPositions(this.controlLeftDown, (- this.containerOffset / 2) / scaleX, (this.height - this.containerOffset / 2) / scaleY);
        this.setControlPositions(this.controlRightUp, (this.width - this.containerOffset / 2) / scaleX, (this.height - this.containerOffset / 2) / scaleY);
        this.setControlPositions(this.controlRightDown, (this.width - this.containerOffset / 2) / scaleX, (- this.containerOffset / 2) / scaleY);
        this.setControlPositions(this.containerStroke, (- this.containerOffset / 2) / scaleX, (- this.containerOffset / 2) / scaleY);
    }


    setInteractive () {
        this.controlLeftUp.interactive = true;
        this.controlLeftDown.interactive = true;
        this.controlRightUp.interactive = true;
        this.controlRightDown.interactive = true;

        this.container.hitArea = new Rectangle(-4, -4, this.width + 8, this.height + 8);
    }

    setControlPositions (element, coorX, coorY) {
        element.position.x = coorX;
        element.position.y = coorY;
    }

    setControlScale (element, scaleX, scaleY) {
        element.scale.set(1 / scaleX, 1 / scaleY);
    }
}