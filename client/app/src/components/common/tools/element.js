import { Container, Graphics, Rectangle, BitmapText } from 'pixi.js';
import { v4 as uuidv4 } from 'uuid';

export default class Element {
    leftUpCornerX = null;
    leftUpCornerY = null;
    rightDownCornerX = null;
    rightDownCornerY = null;
    owner = null;
    elementType = null;
    elementGraphics = null;
    selectedColor = 0x0000FF;
    selectedTextColor = 0x0000FF;
    selectedElement = false;

    initialOffsetX = 0;
    initialOffsetY = 0;

    elementTextString = '';
    ownerTextGraphics = null;
    elementTextGraphics = null;
    allowText = false;
    textMargin = 12;

    pointsArray = [];
    scalePenX = 1;
    scalePenY = 1;

    initialWidth = 1;
    initialHeight = 1;

    elementId = null;

    constructor (typeTool, color) {
        switch(typeTool) {
            case 'penTool':
                this.elementType = 'pen';
                this.selectedColor = color;
                break;
            case 'rectTool':
                this.elementType = 'rect';
                this.selectedColor = color;
                break;
            case 'ellipseTool':
                this.elementType = 'ellipse';
                this.selectedColor = color;
                break;
            case 'textTool':
                this.elementType = 'text';
                this.selectedTextColor = color;
                break;
            case 'arrowTool':
                this.elementType = 'arrow';
                this.selectedColor = color;
                break;
            default:
                this.elementType = null;
                break;
        }
        this.elementId = uuidv4();
        this.elementGraphics = new Graphics();
        this.elementTextGraphics = new BitmapText({
            text: this.elementTextString,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: this.selectedTextColor,
                wordWrap: true,
                wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX - this.textMargin,
                align: 'left',
            }
        })
    }

    redrawGraphics() {
        switch(this.elementType) {
            case 'pen':
                this.redrawPen();
                break;
            case 'arrow':
                this.redrawArrow();
                break;
            case 'rect':
                this.redrawRect();
                break;
            case 'ellipse':
                this.redrawEllipse();
                break;
            case 'text':
                this.redrawRect();
                break;
            default:
                console.log('Error: unexisting type graphics');
                break;
        }
    }

    redrawBusyGraphics() {
        switch(this.elementType) {
            case 'pen':
                this.redrawBusyPen();
                break;
            case 'arrow':
                this.redrawBusyArrow();
                break;
            case 'rect':
                this.redrawBusyRect();
                break;
            case 'ellipse':
                this.redrawBusyEllipse();
                break;
            case 'text':
                this.redrawBusyRect();
                break;
            default:
                console.log('Error: unexisting type graphics');
                break;
        }
    }

    setOwnerTextGraphics() {
        this.ownerTextGraphics = new BitmapText({
            text: this.owner,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFF0000,
                wordWrap: true,
                wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                align: 'left',
            }
        });
        this.ownerTextGraphics.position.x = this.leftUpCornerX;
        this.ownerTextGraphics.position.y = this.leftUpCornerY - 25;
    }

    setPositionSelectedElement(outerContainerLCX, outerContainerLCY) {
        if (this.elementType == 'rect' || this.elementType == 'ellipse' || this.elementType == 'text') {
            this.elementGraphics.position.x = this.leftUpCornerX - outerContainerLCX;
            this.elementGraphics.position.y = this.leftUpCornerY - outerContainerLCY;
        } else {
            if (this.scalePenX < 0) {
                this.elementGraphics.position.x = this.rightDownCornerX - outerContainerLCX - this.initialOffsetX * this.scalePenX;
            } else {
                this.elementGraphics.position.x = this.leftUpCornerX - outerContainerLCX - this.initialOffsetX * this.scalePenX;
            }
            if (this.scalePenY < 0) {
                this.elementGraphics.position.y = this.rightDownCornerY - outerContainerLCY - this.initialOffsetY * this.scalePenY;
            } else {
                this.elementGraphics.position.y = this.leftUpCornerY - outerContainerLCY - this.initialOffsetY * this.scalePenY;
            }
        }
    }

    setSelectedStroke() {
        if (!(this.elementGraphics instanceof BitmapText)) {
            this.elementGraphics.stroke({ color: 0x0095FF, width: 2, alignment: 0.5});
        }
    }

    setSelectedBusyStroke() {
        if (!(this.elementGraphics instanceof BitmapText)) {
            this.elementGraphics.stroke({ color: 0xFF0048, width: 2, alignment: 0.5});
        }
    }

    setHitArea(localPoint) {
        if (this.elementType == 'arrow' || this.elementType == 'pen') {
            this.elementGraphics.hitArea = new Rectangle(localPoint.x, localPoint.y, this.rightDownCornerX - this.leftUpCornerX, this.rightDownCornerY - this.leftUpCornerY);
        } else {
            this.elementGraphics.hitArea = new Rectangle(0, 0, this.rightDownCornerX - this.leftUpCornerX, this.rightDownCornerY - this.leftUpCornerY);
        }
    }

    setSelectMode(selectMode) {
        this.selectedElement = selectMode;
    }

    setPositionGraphics() {
        this.elementGraphics.position.x = this.leftUpCornerX;
        this.elementGraphics.position.y = this.leftUpCornerY;
    }

    setPositionTextGraphics(outerContainerLCX = null, outerContainerLCY = null) {
        if (outerContainerLCX && outerContainerLCY) {
            this.elementTextGraphics.position.x = this.leftUpCornerX - outerContainerLCX + this.textMargin;
            this.elementTextGraphics.position.y = this.leftUpCornerY - outerContainerLCY + this.textMargin;
        } else {
            this.elementTextGraphics.position.x = this.leftUpCornerX + this.textMargin;
            this.elementTextGraphics.position.y = this.leftUpCornerY + this.textMargin;
        }
    }

    setFill() {
        if (this.elementType !== 'text') {
            if (this.selectedColor !== null) {
                this.elementGraphics.fill({color: this.selectedColor})
            }
        }
    }

    setLine() {
        this.elementGraphics.setStrokeStyle({ color: this.selectedColor, width: 2, cap: "round", join: "round"});
        this.elementGraphics.moveTo(this.pointsArray[0].x * this.scalePenX, this.pointsArray[0].y * this.scalePenY);
        for (let i = 1; i < this.pointsArray.length; i++) {
            this.elementGraphics.lineTo(this.pointsArray[i].x * this.scalePenX, this.pointsArray[i].y * this.scalePenY);
            this.elementGraphics.moveTo(this.pointsArray[i].x * this.scalePenX, this.pointsArray[i].y * this.scalePenY);
        }
        this.elementGraphics.stroke();
    }

    setBusyLine() {
        this.elementGraphics.setStrokeStyle({ color: 0xFF0000, width: 2, cap: "round", join: "round", alpha: 1});
        this.elementGraphics.moveTo(this.pointsArray[0].x * this.scalePenX, this.pointsArray[0].y * this.scalePenY);
        for (let i = 1; i < this.pointsArray.length; i++) {
            this.elementGraphics.lineTo(this.pointsArray[i].x * this.scalePenX, this.pointsArray[i].y * this.scalePenY);
            this.elementGraphics.moveTo(this.pointsArray[i].x * this.scalePenX, this.pointsArray[i].y * this.scalePenY);
        }
        this.elementGraphics.stroke();
    }

    redrawPen () {
        if (this.elementGraphics.destroyed) {
            this.elementGraphics = new Graphics();
            this.setLine();
        } else {
            this.elementGraphics.clear();
            this.setLine();
        }

        if (this.selectedElement) {
            if (this.initialOffsetX == this.leftUpCornerX || this.initialOffsetY == this.leftUpCornerY) {
                this.elementGraphics.position.x = - this.initialOffsetX / this.scalePenX;
                this.elementGraphics.position.y = - this.initialOffsetY / this.scalePenY;
            } else {
                this.elementGraphics.position.x = - this.initialOffsetX / this.scalePenX;
                this.elementGraphics.position.y = - this.initialOffsetY / this.scalePenY;
            }
        } else {
            if (this.scalePenX < 0) {
                this.elementGraphics.position.x = this.rightDownCornerX - this.initialOffsetX * this.scalePenX;
            } else {
                this.elementGraphics.position.x = this.leftUpCornerX - this.initialOffsetX * this.scalePenX;
            }
            if (this.scalePenY < 0) {
                this.elementGraphics.position.y = this.rightDownCornerY - this.initialOffsetY * this.scalePenY;
            } else {
                this.elementGraphics.position.y = this.leftUpCornerY - this.initialOffsetY * this.scalePenY;
            }
        }
    }

    redrawBusyPen() {
        if (this.elementGraphics.destroyed) {
            this.elementGraphics = new Graphics();
            this.setBusyLine();
        } else {
            this.elementGraphics.clear();
            this.setBusyLine();
        }

        if (this.scalePenX < 0) {
            this.elementGraphics.position.x = this.rightDownCornerX - this.initialOffsetX * this.scalePenX;
        } else {
            this.elementGraphics.position.x = this.leftUpCornerX - this.initialOffsetX * this.scalePenX;
        }
        if (this.scalePenY < 0) {
            this.elementGraphics.position.y = this.rightDownCornerY - this.initialOffsetY * this.scalePenY;
        } else {
            this.elementGraphics.position.y = this.leftUpCornerY - this.initialOffsetY * this.scalePenY;
        }
    }

    setArrow() {
        this.elementGraphics.setStrokeStyle({ color: this.selectedColor, width: 2, cap: "round", join: "round"});
        this.elementGraphics.moveTo(this.pointsArray[0].x * this.scalePenX, this.pointsArray[0].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsArray[1].x * this.scalePenX, this.pointsArray[1].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsArray[1].x * this.scalePenX, this.pointsArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsArray[2].x * this.scalePenX, this.pointsArray[2].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsArray[1].x * this.scalePenX, this.pointsArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsArray[3].x * this.scalePenX, this.pointsArray[3].y * this.scalePenY);
        this.elementGraphics.stroke();
    }

    setBusyArrow() {
        this.elementGraphics.setStrokeStyle({ color: 0xFF0000, width: 2, cap: "round", join: "round", alpha: 1});
        this.elementGraphics.moveTo(this.pointsArray[0].x * this.scalePenX, this.pointsArray[0].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsArray[1].x * this.scalePenX, this.pointsArray[1].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsArray[1].x * this.scalePenX, this.pointsArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsArray[2].x * this.scalePenX, this.pointsArray[2].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsArray[1].x * this.scalePenX, this.pointsArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsArray[3].x * this.scalePenX, this.pointsArray[3].y * this.scalePenY);
        this.elementGraphics.stroke();
    }

    redrawArrow () {
        if (this.elementGraphics.destroyed) {
            this.elementGraphics = new Graphics();
            this.setArrow();
        } else {
            this.elementGraphics.clear();
            this.setArrow();
        }

        if (this.selectedElement) {
            if (this.initialOffsetX == this.leftUpCornerX || this.initialOffsetY == this.leftUpCornerY) {
                this.elementGraphics.position.x = - this.initialOffsetX / this.scalePenX;
                this.elementGraphics.position.y = - this.initialOffsetY / this.scalePenY;
            } else {
                this.elementGraphics.position.x = - this.initialOffsetX / this.scalePenX;
                this.elementGraphics.position.y = - this.initialOffsetY / this.scalePenY;
            }
        } else {
            if (this.scalePenX < 0) {
                this.elementGraphics.position.x = this.rightDownCornerX - this.initialOffsetX * this.scalePenX;
            } else {
                this.elementGraphics.position.x = this.leftUpCornerX - this.initialOffsetX * this.scalePenX;
            }
            if (this.scalePenY < 0) {
                this.elementGraphics.position.y = this.rightDownCornerY - this.initialOffsetY * this.scalePenY;
            } else {
                this.elementGraphics.position.y = this.leftUpCornerY - this.initialOffsetY * this.scalePenY;
            }
        }
    }

    redrawBusyArrow () {
        if (this.elementGraphics.destroyed) {
            this.elementGraphics = new Graphics();
            this.setBusyArrow();
        } else {
            this.elementGraphics.clear();
            this.setBusyArrow();
        }

        if (this.scalePenX < 0) {
            this.elementGraphics.position.x = this.rightDownCornerX - this.initialOffsetX * this.scalePenX;
        } else {
            this.elementGraphics.position.x = this.leftUpCornerX - this.initialOffsetX * this.scalePenX;
        }
        if (this.scalePenY < 0) {
            this.elementGraphics.position.y = this.rightDownCornerY - this.initialOffsetY * this.scalePenY;
        } else {
            this.elementGraphics.position.y = this.leftUpCornerY - this.initialOffsetY * this.scalePenY;
        }
    }

    redrawRect () {
        if (!(this.elementGraphics instanceof BitmapText)) {
            if (this.elementGraphics.destroyed) {
                this.elementGraphics = new Graphics();
            } else {
                this.elementGraphics.clear();
                this.elementGraphics.scale.set(1, 1);
            }
            this.elementGraphics.rect(
                0,
                0,
                Math.abs(this.rightDownCornerX - this.leftUpCornerX),
                Math.abs(this.rightDownCornerY - this.leftUpCornerY)
            )
            if (this.allowText) {
                if (this.elementType == 'text') {
                    this.elementTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                        align: 'left',
                    };
                } else {
                    this.elementTextGraphics.text = this.elementTextString;
                    this.elementTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX - this.textMargin,
                        align: 'left',
                    };
                }
                this.elementTextGraphics.alpha = 1;
            }
            if (this.elementType == 'text') {
                this.elementGraphics.position.x = this.leftUpCornerX;
                this.elementGraphics.position.y = this.leftUpCornerY;
                this.elementGraphics.setStrokeStyle({ width: 2, color: 0x0095FF });
                this.elementGraphics.stroke();
            }
        } else {
            if (this.elementGraphics.destroyed) {
                this.elementGraphics = new BitmapText({
                    text: this.elementTextString,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                        align: 'left',
                    }
                });
            } else {
                this.elementGraphics.scale.set(1, 1);
            }
            this.elementGraphics.text = this.elementTextString;
            this.elementGraphics.style = {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: this.selectedTextColor,
                wordWrap: true,
                wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                align: 'left',
            };
            this.elementGraphics.alpha = 1;
        }
        this.setPositionGraphics();
        this.setFill();
    }

    redrawBusyRect () {
        if (!(this.elementGraphics instanceof BitmapText)) {
            if (this.elementGraphics.destroyed) {
                this.elementGraphics = new Graphics();
            } else {
                this.elementGraphics.clear();
                this.elementGraphics.scale.set(1, 1);
            }
            this.elementGraphics.fill({color: this.selectedColor, alpha: 0.5});
            this.elementGraphics.rect(
                0,
                0,
                Math.abs(this.rightDownCornerX - this.leftUpCornerX),
                Math.abs(this.rightDownCornerY - this.leftUpCornerY)
            )
            this.elementGraphics.setStrokeStyle({ width: 2, color: 0xFF0000 });
            this.elementGraphics.stroke();
            if (this.allowText) {
                if (this.elementType == 'text') {
                    this.elementTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                        align: 'left',
                    };
                } else {
                    this.elementTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX - this.textMargin,
                        align: 'left',
                    };
                }
                this.elementTextGraphics.alpha = 0.5;
            }
            if (this.elementType == 'text') {
                this.elementGraphics.position.x = this.leftUpCornerX;
                this.elementGraphics.position.y = this.leftUpCornerY;
                this.elementGraphics.setStrokeStyle({ width: 2, color: 0x0095FF });
                this.elementGraphics.stroke();
            }
        } else {
            if (this.elementGraphics.destroyed) {
                this.elementGraphics = new BitmapText({
                    text: this.elementTextString,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: 0xFF0000,
                        wordWrap: true,
                        wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                        align: 'left',
                    }
                });
            } else {
                this.elementGraphics.scale.set(1, 1);
            }
            this.elementGraphics.text = this.elementTextString;
            this.elementGraphics.style = {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFF0000,
                wordWrap: true,
                wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                align: 'left',
            };
        }
        this.setPositionGraphics();
    }

    redrawText () {
        this.elementGraphics.clear();
        this.elementGraphics = new BitmapText({
            text: this.elementTextString,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: this.selectedColor,
                wordWrap: true,
                wordWrapWidth: this.rightDownCornerX - this.leftUpCornerX,
                align: 'left',
            }
        });
    }

    redrawEllipse () {
        if (this.elementGraphics.destroyed) {
            this.elementGraphics = new Graphics();
        } else {
            this.elementGraphics.clear();
        }
        this.elementGraphics.ellipse(
            (this.rightDownCornerX - this.leftUpCornerX) / 2,
            (this.rightDownCornerY - this.leftUpCornerY) / 2,
            Math.abs(this.rightDownCornerX - this.leftUpCornerX) / 2,
            Math.abs(this.rightDownCornerY - this.leftUpCornerY) / 2
        )

        if (!this.selectedElement) {
            this.setPositionGraphics();
        }

        this.setFill();
    }

    redrawBusyEllipse () {
        if (this.elementGraphics.destroyed) {
            this.elementGraphics = new Graphics();
        } else {
            this.elementGraphics.clear();
        }
        this.elementGraphics.fill({color: this.selectedColor, alpha: 0.5});
        this.elementGraphics.ellipse(
            (this.rightDownCornerX - this.leftUpCornerX) / 2,
            (this.rightDownCornerY - this.leftUpCornerY) / 2,
            Math.abs(this.rightDownCornerX - this.leftUpCornerX) / 2,
            Math.abs(this.rightDownCornerY - this.leftUpCornerY) / 2
        )
        this.elementGraphics.setStrokeStyle({ width: 2, color: 0xFF0000 });
        this.elementGraphics.stroke();
        this.setPositionGraphics();
    }
}