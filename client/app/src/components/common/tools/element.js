import { Container, Graphics, Rectangle, BitmapText } from 'pixi.js';
import { v4 as uuidv4 } from 'uuid';

export default class Element {
    LeftCornerX = null;
    LeftCornerY = null;
    RightCornerX = null;
    RightCornerY = null;
    owner = null;
    type = null;
    elementGraphics = null;
    selectedColor = 0x0000FF;
    selectedTextColor = 0x0000FF;
    selectedElement = false;

    offsetPenX = 0;
    offsetPenY = 0;

    textString = '';
    ownerTextGraphics = null;
    innerTextGraphics = null;
    allowText = false;
    textMargin = 12;

    pointsPenArray = [];
    scalePenX = 1;
    scalePenY = 1;

    initialWidth = 1;
    initialHeight = 1;

    elementId = null;

    constructor (typeTool, color) {
        switch(typeTool) {
            case 'penTool':
                this.type = 'pen';
                this.selectedColor = color;
                break;
            case 'rectTool':
                this.type = 'rect';
                this.selectedColor = color;
                break;
            case 'ellipseTool':
                this.type = 'ellipse';
                this.selectedColor = color;
                break;
            case 'textTool':
                this.type = 'text';
                this.selectedTextColor = color;
                break;
            case 'arrowTool':
                this.type = 'arrow';
                this.selectedColor = color;
                break;
            default:
                this.type = null;
                break;
        }
        this.elementId = uuidv4();
        this.elementGraphics = new Graphics();
        this.innerTextGraphics = new BitmapText({
            text: this.textString,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: this.selectedTextColor,
                wordWrap: true,
                wordWrapWidth: this.RightCornerX - this.LeftCornerX - this.textMargin,
                align: 'left',
            }
        })
    }

    redrawGraphics() {
        switch(this.type) {
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
        switch(this.type) {
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
                wordWrapWidth: this.RightCornerX - this.LeftCornerX,
                align: 'left',
            }
        });
        this.ownerTextGraphics.position.x = this.LeftCornerX;
        this.ownerTextGraphics.position.y = this.LeftCornerY - 25;
    }

    setPositionAsSelected(outerContainerLCX, outerContainerLCY) {
        if (this.type == 'rect' || this.type == 'ellipse' || this.type == 'text') {
            this.elementGraphics.position.x = this.LeftCornerX - outerContainerLCX;
            this.elementGraphics.position.y = this.LeftCornerY - outerContainerLCY;
        } else {
            if (this.scalePenX < 0) {
                this.elementGraphics.position.x = this.RightCornerX - outerContainerLCX - this.offsetPenX * this.scalePenX;
            } else {
                this.elementGraphics.position.x = this.LeftCornerX - outerContainerLCX - this.offsetPenX * this.scalePenX;
            }
            if (this.scalePenY < 0) {
                this.elementGraphics.position.y = this.RightCornerY - outerContainerLCY - this.offsetPenY * this.scalePenY;
            } else {
                this.elementGraphics.position.y = this.LeftCornerY - outerContainerLCY - this.offsetPenY * this.scalePenY;
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
        if (this.type == 'arrow' || this.type == 'pen') {
            this.elementGraphics.hitArea = new Rectangle(localPoint.x, localPoint.y, this.RightCornerX - this.LeftCornerX, this.RightCornerY - this.LeftCornerY);
        } else {
            this.elementGraphics.hitArea = new Rectangle(0, 0, this.RightCornerX - this.LeftCornerX, this.RightCornerY - this.LeftCornerY);
        }
    }

    setSelectMode(selectMode) {
        this.selectedElement = selectMode;
    }

    setPosition() {
        this.elementGraphics.position.x = this.LeftCornerX;
        this.elementGraphics.position.y = this.LeftCornerY;
    }

    setPositionInnerText(outerContainerLCX = null, outerContainerLCY = null) {
        if (outerContainerLCX && outerContainerLCY) {
            this.innerTextGraphics.position.x = this.LeftCornerX - outerContainerLCX + this.textMargin;
            this.innerTextGraphics.position.y = this.LeftCornerY - outerContainerLCY + this.textMargin;
        } else {
            this.innerTextGraphics.position.x = this.LeftCornerX + this.textMargin;
            this.innerTextGraphics.position.y = this.LeftCornerY + this.textMargin;
        }
    }

    setFill() {
        if (this.type !== 'text') {
            if (this.selectedColor !== null) {
                this.elementGraphics.fill({color: this.selectedColor})
            }
        }
    }

    setLine() {
        this.elementGraphics.setStrokeStyle({ color: this.selectedColor, width: 2, cap: "round", join: "round"});
        this.elementGraphics.moveTo(this.pointsPenArray[0].x * this.scalePenX, this.pointsPenArray[0].y * this.scalePenY);
        for (let i = 1; i < this.pointsPenArray.length; i++) {
            this.elementGraphics.lineTo(this.pointsPenArray[i].x * this.scalePenX, this.pointsPenArray[i].y * this.scalePenY);
            this.elementGraphics.moveTo(this.pointsPenArray[i].x * this.scalePenX, this.pointsPenArray[i].y * this.scalePenY);
        }
        this.elementGraphics.stroke();
    }

    setBusyLine() {
        this.elementGraphics.setStrokeStyle({ color: 0xFF0000, width: 2, cap: "round", join: "round", alpha: 1});
        this.elementGraphics.moveTo(this.pointsPenArray[0].x * this.scalePenX, this.pointsPenArray[0].y * this.scalePenY);
        for (let i = 1; i < this.pointsPenArray.length; i++) {
            this.elementGraphics.lineTo(this.pointsPenArray[i].x * this.scalePenX, this.pointsPenArray[i].y * this.scalePenY);
            this.elementGraphics.moveTo(this.pointsPenArray[i].x * this.scalePenX, this.pointsPenArray[i].y * this.scalePenY);
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
            if (this.offsetPenX == this.LeftCornerX || this.offsetPenY == this.LeftCornerY) {
                this.elementGraphics.position.x = - this.offsetPenX / this.scalePenX;
                this.elementGraphics.position.y = - this.offsetPenY / this.scalePenY;
            } else {
                this.elementGraphics.position.x = - this.offsetPenX / this.scalePenX;
                this.elementGraphics.position.y = - this.offsetPenY / this.scalePenY;
            }
        } else {
            if (this.scalePenX < 0) {
                this.elementGraphics.position.x = this.RightCornerX - this.offsetPenX * this.scalePenX;
            } else {
                this.elementGraphics.position.x = this.LeftCornerX - this.offsetPenX * this.scalePenX;
            }
            if (this.scalePenY < 0) {
                this.elementGraphics.position.y = this.RightCornerY - this.offsetPenY * this.scalePenY;
            } else {
                this.elementGraphics.position.y = this.LeftCornerY - this.offsetPenY * this.scalePenY;
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
            this.elementGraphics.position.x = this.RightCornerX - this.offsetPenX * this.scalePenX;
        } else {
            this.elementGraphics.position.x = this.LeftCornerX - this.offsetPenX * this.scalePenX;
        }
        if (this.scalePenY < 0) {
            this.elementGraphics.position.y = this.RightCornerY - this.offsetPenY * this.scalePenY;
        } else {
            this.elementGraphics.position.y = this.LeftCornerY - this.offsetPenY * this.scalePenY;
        }
    }

    setArrow() {
        this.elementGraphics.setStrokeStyle({ color: this.selectedColor, width: 2, cap: "round", join: "round"});
        this.elementGraphics.moveTo(this.pointsPenArray[0].x * this.scalePenX, this.pointsPenArray[0].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsPenArray[1].x * this.scalePenX, this.pointsPenArray[1].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsPenArray[1].x * this.scalePenX, this.pointsPenArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsPenArray[2].x * this.scalePenX, this.pointsPenArray[2].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsPenArray[1].x * this.scalePenX, this.pointsPenArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsPenArray[3].x * this.scalePenX, this.pointsPenArray[3].y * this.scalePenY);
        this.elementGraphics.stroke();
    }

    setBusyArrow() {
        this.elementGraphics.setStrokeStyle({ color: 0xFF0000, width: 2, cap: "round", join: "round", alpha: 1});
        this.elementGraphics.moveTo(this.pointsPenArray[0].x * this.scalePenX, this.pointsPenArray[0].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsPenArray[1].x * this.scalePenX, this.pointsPenArray[1].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsPenArray[1].x * this.scalePenX, this.pointsPenArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsPenArray[2].x * this.scalePenX, this.pointsPenArray[2].y * this.scalePenY);
        this.elementGraphics.moveTo(this.pointsPenArray[1].x * this.scalePenX, this.pointsPenArray[1].y * this.scalePenY);
        this.elementGraphics.lineTo(this.pointsPenArray[3].x * this.scalePenX, this.pointsPenArray[3].y * this.scalePenY);
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
            if (this.offsetPenX == this.LeftCornerX || this.offsetPenY == this.LeftCornerY) {
                this.elementGraphics.position.x = - this.offsetPenX / this.scalePenX;
                this.elementGraphics.position.y = - this.offsetPenY / this.scalePenY;
            } else {
                this.elementGraphics.position.x = - this.offsetPenX / this.scalePenX;
                this.elementGraphics.position.y = - this.offsetPenY / this.scalePenY;
            }
        } else {
            if (this.scalePenX < 0) {
                this.elementGraphics.position.x = this.RightCornerX - this.offsetPenX * this.scalePenX;
            } else {
                this.elementGraphics.position.x = this.LeftCornerX - this.offsetPenX * this.scalePenX;
            }
            if (this.scalePenY < 0) {
                this.elementGraphics.position.y = this.RightCornerY - this.offsetPenY * this.scalePenY;
            } else {
                this.elementGraphics.position.y = this.LeftCornerY - this.offsetPenY * this.scalePenY;
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
            this.elementGraphics.position.x = this.RightCornerX - this.offsetPenX * this.scalePenX;
        } else {
            this.elementGraphics.position.x = this.LeftCornerX - this.offsetPenX * this.scalePenX;
        }
        if (this.scalePenY < 0) {
            this.elementGraphics.position.y = this.RightCornerY - this.offsetPenY * this.scalePenY;
        } else {
            this.elementGraphics.position.y = this.LeftCornerY - this.offsetPenY * this.scalePenY;
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
                Math.abs(this.RightCornerX - this.LeftCornerX),
                Math.abs(this.RightCornerY - this.LeftCornerY)
            )
            if (this.allowText) {
                if (this.type == 'text') {
                    this.innerTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.RightCornerX - this.LeftCornerX,
                        align: 'left',
                    };
                } else {
                    this.innerTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.RightCornerX - this.LeftCornerX - this.textMargin,
                        align: 'left',
                    };
                }
                this.innerTextGraphics.alpha = 1;
            }
            if (this.type == 'text') {
                this.elementGraphics.position.x = this.LeftCornerX;
                this.elementGraphics.position.y = this.LeftCornerY;
                this.elementGraphics.setStrokeStyle({ width: 2, color: 0x0095FF });
                this.elementGraphics.stroke();
            }
        } else {
            if (this.elementGraphics.destroyed) {
                this.elementGraphics = new BitmapText({
                    text: this.textString,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.RightCornerX - this.LeftCornerX,
                        align: 'left',
                    }
                });
            } else {
                this.elementGraphics.scale.set(1, 1);
            }
            this.elementGraphics.text = this.textString;
            this.elementGraphics.style = {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: this.selectedTextColor,
                wordWrap: true,
                wordWrapWidth: this.RightCornerX - this.LeftCornerX,
                align: 'left',
            };
            this.elementGraphics.alpha = 1;
        }
        this.setPosition();
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
                Math.abs(this.RightCornerX - this.LeftCornerX),
                Math.abs(this.RightCornerY - this.LeftCornerY)
            )
            this.elementGraphics.setStrokeStyle({ width: 2, color: 0xFF0000 });
            this.elementGraphics.stroke();
            if (this.allowText) {
                if (this.type == 'text') {
                    this.innerTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.RightCornerX - this.LeftCornerX,
                        align: 'left',
                    };
                } else {
                    this.innerTextGraphics.style = {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: this.selectedTextColor,
                        wordWrap: true,
                        wordWrapWidth: this.RightCornerX - this.LeftCornerX - this.textMargin,
                        align: 'left',
                    };
                }
                this.innerTextGraphics.alpha = 0.5;
            }
            if (this.type == 'text') {
                this.elementGraphics.position.x = this.LeftCornerX;
                this.elementGraphics.position.y = this.LeftCornerY;
                this.elementGraphics.setStrokeStyle({ width: 2, color: 0x0095FF });
                this.elementGraphics.stroke();
            }
        } else {
            if (this.elementGraphics.destroyed) {
                this.elementGraphics = new BitmapText({
                    text: this.textString,
                    style: {
                        fontFamily: 'Arial',
                        fontSize: 24,
                        fill: 0xFF0000,
                        wordWrap: true,
                        wordWrapWidth: this.RightCornerX - this.LeftCornerX,
                        align: 'left',
                    }
                });
            } else {
                this.elementGraphics.scale.set(1, 1);
            }
            this.elementGraphics.text = this.textString;
            this.elementGraphics.style = {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: 0xFF0000,
                wordWrap: true,
                wordWrapWidth: this.RightCornerX - this.LeftCornerX,
                align: 'left',
            };
        }
        this.setPosition();
    }

    redrawText () {
        this.elementGraphics.clear();
        this.elementGraphics = new BitmapText({
            text: this.textString,
            style: {
                fontFamily: 'Arial',
                fontSize: 24,
                fill: this.selectedColor,
                wordWrap: true,
                wordWrapWidth: this.RightCornerX - this.LeftCornerX,
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
            (this.RightCornerX - this.LeftCornerX) / 2,
            (this.RightCornerY - this.LeftCornerY) / 2,
            Math.abs(this.RightCornerX - this.LeftCornerX) / 2,
            Math.abs(this.RightCornerY - this.LeftCornerY) / 2
        )

        if (!this.selectedElement) {
            this.setPosition();
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
            (this.RightCornerX - this.LeftCornerX) / 2,
            (this.RightCornerY - this.LeftCornerY) / 2,
            Math.abs(this.RightCornerX - this.LeftCornerX) / 2,
            Math.abs(this.RightCornerY - this.LeftCornerY) / 2
        )
        this.elementGraphics.setStrokeStyle({ width: 2, color: 0xFF0000 });
        this.elementGraphics.stroke();
        this.setPosition();
    }
}