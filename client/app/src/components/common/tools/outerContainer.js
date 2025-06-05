import { BitmapText, Container, Graphics, Rectangle } from 'pixi.js';
import BinSearchTree from './binSearchTree';

export default class OuterContainer {
    LeftCornerX = null;
    LeftCornerY = null;
    RightCornerX = null;
    RightCornerY = null;
    containerWidth = null;
    containerHeight = null;
    elementsIds = [];
    owner = null;
    type = null;
    mainContainer = new Container();
    containerOffset = 64;
    strokeGraphicsRect = new Graphics();
    controlLeftUp = new Graphics();
    controlLeftDown = new Graphics();
    controlRightUp = new Graphics();
    controlRightDown = new Graphics();
    controlArrowsWidthRect = 12;
    controlArrowsHeightRect = 8;
    xCoordinates = new BinSearchTree();
    yCoordinates = new BinSearchTree();
    lastMoveDiffX = null;
    lastMoveDiffY = null;

    constructor () {
        this.calcSquares();
        this.mainContainer.sortableChildren = true;
        this.mainContainer.label = "outerContainer";
    }

    calcSquares () {
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
        this.strokeGraphicsRect.zIndex = 2;
    }

    calcStroke () {
        if (this.strokeGraphicsRect.destroyed) {
            this.strokeGraphicsRect = new Graphics();
        } else {
            this.strokeGraphicsRect.clear();
        }
        const strokeWidth = Math.abs(this.RightCornerX - this.LeftCornerX);
        const strokeHeight = Math.abs(this.RightCornerY - this.LeftCornerY);
        this.strokeGraphicsRect.rect(
            this.containerOffset / 2,
            this.containerOffset / 2,
            strokeWidth,
            strokeHeight
        )
    }

    addElementCoordinates (elementCoordinateX, elementCoordinateY) {
        this.xCoordinates.insertCoordinate(elementCoordinateX);
        this.yCoordinates.insertCoordinate(elementCoordinateY);
    }

    setNewCornersAddElement () {
        const [minValX, maxValX] = this.xCoordinates.getNewCorners();
        const [minValY, maxValY] = this.yCoordinates.getNewCorners();

        this.LeftCornerX = minValX;
        this.LeftCornerY = minValY;

        this.RightCornerX = maxValX;
        this.RightCornerY = maxValY;

        this.containerWidth = this.RightCornerX - this.LeftCornerX;
        this.containerHeight = this.RightCornerY - this.LeftCornerY;

        this.setPositionsControl();
    }
    
    addElement (stageElement) {
        this.mainContainer.removeChild(this.strokeGraphicsRect, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        let oldCornerX = this.LeftCornerX;
        let oldCornerY = this.LeftCornerY;

        if (this.LeftCornerX == null) {
            this.LeftCornerX = stageElement.LeftCornerX;
            this.LeftCornerY = stageElement.LeftCornerY;
            this.RightCornerX = stageElement.RightCornerX;
            this.RightCornerY = stageElement.RightCornerY;
        } else {
            this.LeftCornerX = (stageElement.LeftCornerX < this.LeftCornerX) ? stageElement.LeftCornerX : this.LeftCornerX;
            this.LeftCornerY = (stageElement.LeftCornerY < this.LeftCornerY) ? stageElement.LeftCornerY : this.LeftCornerY;
            this.RightCornerX = (stageElement.RightCornerX > this.RightCornerX) ? stageElement.RightCornerX : this.RightCornerX;
            this.RightCornerY = (stageElement.RightCornerY > this.RightCornerY) ? stageElement.RightCornerY : this.RightCornerY;
        }

        this.mainContainer.children.forEach((child) => {
            child.position.x += oldCornerX - this.LeftCornerX;
            child.position.y += oldCornerY - this.LeftCornerY;
        })

        this.xCoordinates.insertCoordinate(stageElement.LeftCornerX);
        this.xCoordinates.insertCoordinate(stageElement.RightCornerX);
        this.yCoordinates.insertCoordinate(stageElement.LeftCornerY);
        this.yCoordinates.insertCoordinate(stageElement.RightCornerY);

        this.containerWidth = this.RightCornerX - this.LeftCornerX;
        this.containerHeight = this.RightCornerY - this.LeftCornerY;

        this.calcStroke();
        stageElement.elementGraphics.label = "selectedElement";
        stageElement.elementGraphics.zIndex = 1;
        this.mainContainer.addChild(stageElement.elementGraphics);
        if (stageElement.type == 'rect' && stageElement.allowText) {
            stageElement.setPositionInnerText(this.LeftCornerX, this.LeftCornerY);
            stageElement.innerTextGraphics.zIndex = 2;
            stageElement.innerTextGraphics.text = stageElement.textString;
            stageElement.innerTextGraphics.style = {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFF0000,
                wordWrap: true,
                wordWrapWidth: stageElement.RightCornerX - stageElement.LeftCornerX - stageElement.textMargin,
                align: 'left',
            }
            this.mainContainer.addChild(stageElement.innerTextGraphics);
        }

        this.setPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setPositions(this.controlLeftDown, - this.containerOffset / 2, this.containerHeight - this.containerOffset / 2);
        this.setPositions(this.controlRightUp, this.containerWidth - this.containerOffset / 2, this.containerHeight - this.containerOffset / 2);
        this.setPositions(this.controlRightDown, this.containerWidth - this.containerOffset / 2, - this.containerOffset / 2);
        this.setPositions(this.strokeGraphicsRect, - this.containerOffset / 2, - this.containerOffset / 2);
        this.mainContainer.addChild(this.strokeGraphicsRect, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        this.mainContainer.interactive = true;
        this.mainContainer.position.x = this.LeftCornerX;
        this.mainContainer.position.y = this.LeftCornerY;
    }

    removeElement (stageElement) {
        this.mainContainer.removeChild(stageElement);
    }

    removeCoordinates (selectedElement) {
        this.mainContainer.removeChild(this.strokeGraphicsRect, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        this.xCoordinates.deleteCoordinate(selectedElement.LeftCornerX);
        this.xCoordinates.deleteCoordinate(selectedElement.RightCornerX);

        this.yCoordinates.deleteCoordinate(selectedElement.LeftCornerY);
        this.yCoordinates.deleteCoordinate(selectedElement.RightCornerY);

        let oldCornerX = this.LeftCornerX;
        let oldCornerY = this.LeftCornerY;

        const [minValX, maxValX] = this.xCoordinates.getNewCorners();
        const [minValY, maxValY] = this.yCoordinates.getNewCorners();

        this.LeftCornerX = minValX;
        this.LeftCornerY = minValY;
        this.RightCornerX = maxValX;
        this.RightCornerY = maxValY;

        this.mainContainer.children.forEach((child) => {
            child.position.x += oldCornerX - this.LeftCornerX;
            child.position.y += oldCornerY - this.LeftCornerY;
        })

        this.containerWidth = this.RightCornerX - this.LeftCornerX;
        this.containerHeight = this.RightCornerY - this.LeftCornerY;

        this.calcStroke();

        this.setPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setPositions(this.controlLeftDown, - this.containerOffset / 2, this.containerHeight - this.containerOffset / 2);
        this.setPositions(this.controlRightUp, this.containerWidth - this.containerOffset / 2, this.containerHeight - this.containerOffset / 2);
        this.setPositions(this.controlRightDown, this.containerWidth - this.containerOffset / 2, - this.containerOffset / 2);
        this.setPositions(this.strokeGraphicsRect, - this.containerOffset / 2, - this.containerOffset / 2);
        this.mainContainer.addChild(this.strokeGraphicsRect, this.controlLeftUp, this.controlLeftDown, this.controlRightUp, this.controlRightDown);

        this.mainContainer.interactive = true;
        this.mainContainer.position.x = this.LeftCornerX;
        this.mainContainer.position.y = this.LeftCornerY;
    }

    fillOuterElements () {
        this.controlLeftUp.fill({color: 0x93D2FF});
        this.controlLeftDown.fill({color: 0x93D2FF});
        this.controlRightUp.fill({color: 0x93D2FF});
        this.controlRightDown.fill({color: 0x93D2FF});

        this.mainContainer.children.forEach((child) => {
            if (!(child instanceof BitmapText)) {
                child.stroke({ width: 2, color: 0x0095FF });
            }
        })
    }

    redrawOuterContainer(final, DiffX, DiffY) {
        if (final) {
            this.xCoordinates.addDiffToVal(DiffX);
            this.yCoordinates.addDiffToVal(DiffY);
            this.lastMoveDiffX = DiffX;
            this.lastMoveDiffY = DiffY;
        }
        this.setPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setPositions(this.controlLeftDown, - this.containerOffset / 2, this.containerHeight - this.containerOffset / 2);
        this.setPositions(this.controlRightUp, this.containerWidth - this.containerOffset / 2, this.containerHeight - this.containerOffset / 2);
        this.setPositions(this.controlRightDown, this.containerWidth - this.containerOffset / 2, - this.containerOffset / 2);
        this.setPositions(this.strokeGraphicsRect, - this.containerOffset / 2, - this.containerOffset / 2);
        this.mainContainer.position.x = this.LeftCornerX;
        this.mainContainer.position.y = this.LeftCornerY;
    }

    redrawOuterContainerScale(final, ScaleX, ScaleY, diffCornerX, diffCornerY) {
        this.containerWidth = this.RightCornerX - this.LeftCornerX;
        this.containerHeight = this.RightCornerY - this.LeftCornerY;

        if (final) {
            this.lastScaleX = ScaleX;
            this.lastScaleY = ScaleY;
            this.lastMoveDiffX = diffCornerX;
            this.lastMoveDiffY = diffCornerY;
        }

        let containerControlScaleX = ScaleX;
        let containerControlScaleY = ScaleY;

        this.calcStroke();
        this.strokeGraphicsRect.stroke({ width: 2, color: 0x0095FF });
        [
            this.controlLeftUp, 
            this.controlLeftDown, 
            this.controlRightUp, 
            this.controlRightDown
        ].forEach((element) => {
            this.setScale(element, containerControlScaleX, containerControlScaleY);
        })

        if (this.LeftCornerX > this.RightCornerX) {
            containerControlScaleX = - ScaleX;
        }
        if (this.LeftCornerY > this.RightCornerY) {
            containerControlScaleY = - ScaleY;
        }
        this.setScale(this.strokeGraphicsRect, containerControlScaleX, containerControlScaleY);

        if ((this.LeftCornerX > this.RightCornerX) || (this.LeftCornerY > this.RightCornerY)) {
            this.setPositions(this.strokeGraphicsRect, (- this.containerOffset / 2) / containerControlScaleX, (- this.containerOffset / 2) / containerControlScaleY);
        } else {
            this.setPositions(this.strokeGraphicsRect, (- this.containerOffset / 2) / ScaleX, (- this.containerOffset / 2) / ScaleY);
        }

        this.setPositions(this.controlLeftUp, - this.containerOffset / 2 / ScaleX, - this.containerOffset / 2 / ScaleY);
        this.setPositions(this.controlLeftDown, (- this.containerOffset / 2) / ScaleX, (this.containerHeight - this.containerOffset / 2) / ScaleY);
        this.setPositions(this.controlRightUp, (this.containerWidth - this.containerOffset / 2) / ScaleX, (this.containerHeight - this.containerOffset / 2) / ScaleY);
        this.setPositions(this.controlRightDown, (this.containerWidth - this.containerOffset / 2) / ScaleX, (- this.containerOffset / 2) / ScaleY);
        this.mainContainer.position.x = this.LeftCornerX;
        this.mainContainer.position.y = this.LeftCornerY;
        this.mainContainer.hitArea = new Rectangle(-4, -4, this.containerWidth + 8, this.containerHeight + 8);
    }

    setPositionsControl () {
        this.setPositions(this.controlLeftUp, - this.containerOffset / 2, - this.containerOffset / 2);
        this.setPositions(this.controlLeftDown, (- this.containerOffset / 2), (this.containerHeight - this.containerOffset / 2));
        this.setPositions(this.controlRightUp, (this.containerWidth - this.containerOffset / 2), (this.containerHeight - this.containerOffset / 2));
        this.setPositions(this.controlRightDown, (this.containerWidth - this.containerOffset / 2), (- this.containerOffset / 2));
        this.setPositions(this.strokeGraphicsRect, (- this.containerOffset / 2), (- this.containerOffset / 2));
        this.mainContainer.position.x = this.LeftCornerX;
        this.mainContainer.position.y = this.LeftCornerY;
    }

    setElementsScales (scaleX, scaleY) {
        this.calcStroke();
        this.strokeGraphicsRect.stroke({ width: 2, color: 0x0095FF });

        [
            this.controlLeftUp, 
            this.controlLeftDown, 
            this.controlRightUp, 
            this.controlRightDown,
            this.strokeGraphicsRect
        ].forEach((element) => {
            this.setScale(element, scaleX, scaleY);
        })

        this.setPositions(this.controlLeftUp, - this.containerOffset / 2 / scaleX, - this.containerOffset / 2 / scaleY);
        this.setPositions(this.controlLeftDown, (- this.containerOffset / 2) / scaleX, (this.containerHeight - this.containerOffset / 2) / scaleY);
        this.setPositions(this.controlRightUp, (this.containerWidth - this.containerOffset / 2) / scaleX, (this.containerHeight - this.containerOffset / 2) / scaleY);
        this.setPositions(this.controlRightDown, (this.containerWidth - this.containerOffset / 2) / scaleX, (- this.containerOffset / 2) / scaleY);
        this.setPositions(this.strokeGraphicsRect, (- this.containerOffset / 2) / scaleX, (- this.containerOffset / 2) / scaleY);
    }


    setInteractive () {
        this.controlLeftUp.interactive = true;
        this.controlLeftDown.interactive = true;
        this.controlRightUp.interactive = true;
        this.controlRightDown.interactive = true;

        this.mainContainer.hitArea = new Rectangle(-4, -4, this.containerWidth + 8, this.containerHeight + 8);
    }

    setPositions (element, coorX, coorY) {
        element.position.x = coorX;
        element.position.y = coorY;
    }

    setScale (element, scaleX, scaleY) {
        element.scale.set(1 / scaleX, 1 / scaleY);
    }
}