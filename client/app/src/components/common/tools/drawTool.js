import { BitmapText, Point, Graphics } from 'pixi.js';
import Element from './element';

export default class DrawTool {
    toolName = null;
    changeElement = null;
    startPointX = null;
    startPointY = null;
    endPointX = null;
    endPointY = null;
    scaleMultiply = 1;

    minDiffToRect = 5;
    defaultSquareSize = 50;
    defaultEllipseRadius = 50;

    constructor (toolNameString) {
        this.toolName = toolNameString;
    }

    setDrawableElement (eventData, color, scaleCanvas) {
        this.scaleMultiply = scaleCanvas;
        switch(this.toolName) {
            case 'penTool':
            case 'arrowTool':
                this.setStartPoint(eventData);
                this.setDrawableGraphics(color);
                break;
            case 'rectTool':
            case 'textTool':
                this.setStartPoint(eventData);
                this.setDrawableGraphics(color, this.startPointX, this.startPointY);
                break;
            case 'ellipseTool':
                this.setStartPoint(eventData);
                this.setDrawableGraphics(color);
                break;
            default:
                console.log("Error: unexistsing tool");
                break;
        }
    }

    getPointCoordinates (eventData) {
        const PointX = eventData.x;
        const PointY = eventData.y;
        return [PointX, PointY]
    }
    
    setStartPoint (eventData) {
        const [PointX, PointY] = this.getPointCoordinates(eventData);
        this.startPointX = PointX;
        this.startPointY = PointY;
    }

    setEndPoint (eventData) {
        const [PointX, PointY] = this.getPointCoordinates(eventData);
        this.endPointX = PointX;
        this.endPointY = PointY;
    }

    setDrawableGraphics (color, leftCornerX = null, leftCornerY = null) {
        this.changeElement = new Element(this.toolName, color);
        if (leftCornerX !== null && leftCornerY !== null) {
            this.changeElement.setPosition();
        } else {
            if (this.changeElement.type == 'pen' || this.changeElement.type == 'arrow') {
                this.changeElement.pointsPenArray.push({x: this.startPointX, y: this.startPointY});
                this.changeElement.elementGraphics.moveTo(this.startPointX, this.startPointY);
                this.changeElement.elementGraphics.setStrokeStyle({ color: this.changeElement.selectedColor, width: 2, cap: "round", join: "round"});
                this.changeElement.elementGraphics.stroke();

                this.changeElement.LeftCornerX = this.startPointX;
                this.changeElement.LeftCornerY = this.startPointY;
                this.changeElement.RightCornerX = this.startPointX;
                this.changeElement.RightCornerY = this.startPointY;
            }
        }
    }

    redrawDrawableElement (event, eventData, final, color) {
        switch(this.toolName) {
            case 'penTool':
                this.setEndPoint(eventData);
                this.redrawPenElement(final);
                this.setStartPoint(eventData);
                break;
            case 'arrowTool':
                this.setEndPoint(eventData);
                this.redrawArrowElement(final);
                break;
            case 'rectTool':
                this.setEndPoint(eventData);
                this.redrawRectElement(event, final);
                break;
            case 'ellipseTool':
                this.setEndPoint(eventData);
                this.redrawEllipseElement(event, final);
                break;
            case 'textTool':
                this.setEndPoint(eventData);
                this.redrawTextElement(final);
                break;
            default:
                console.log("Error: unexistsing tool");
                break;
        }
    }

    redrawPenElement (final) {
        this.setNewCornersPen(this.endPointX, this.endPointY);
        this.changeElement.elementGraphics.setStrokeStyle({ color: this.changeElement.selectedColor, width: 2, cap: "round", join: "round"});
        this.changeElement.elementGraphics.stroke();
        this.changeElement.elementGraphics.moveTo(this.startPointX, this.startPointY);
        this.changeElement.elementGraphics.lineTo(this.endPointX, this.endPointY);
        this.changeElement.pointsPenArray.push({x: this.endPointX, y: this.endPointY});
        if (final) {
            this.changeElement.offsetPenX = this.changeElement.LeftCornerX;
            this.changeElement.offsetPenY = this.changeElement.LeftCornerY;
            this.changeElement.initialWidth = this.changeElement.RightCornerX - this.changeElement.LeftCornerX;
            this.changeElement.initialHeight = this.changeElement.RightCornerY - this.changeElement.LeftCornerY;
            this.changeElement.setSelectMode(final);
            this.changeElement.redrawGraphics();
        }
    }

    redrawArrowElement (final) {
        const [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getNewCornersElement(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        this.setNewCornersElement(leftCornerX, leftCornerY, rightCornerX, rightCornerY);

        this.changeElement.elementGraphics.clear();
        this.changeElement.elementGraphics.moveTo(this.startPointX, this.startPointY);
        this.changeElement.elementGraphics.lineTo(this.endPointX, this.endPointY);
        this.changeElement.elementGraphics.moveTo(this.endPointX, this.endPointY);
        const betta = Math.atan2(this.startPointY - this.endPointY, this.startPointX - this.endPointX);

        const x2 = this.endPointX + 10 * Math.cos(betta + Math.PI / 6);
        const y2 = this.endPointY + 10 * Math.sin(betta + Math.PI / 6);
        const x3 = this.endPointX + 10 * Math.cos(betta - Math.PI / 6);
        const y3 = this.endPointY + 10 * Math.sin(betta - Math.PI / 6);

        this.changeElement.elementGraphics.lineTo(x2, y2);
        this.changeElement.elementGraphics.moveTo(this.endPointX, this.endPointY);
        this.changeElement.elementGraphics.lineTo(x3, y3);
        this.changeElement.elementGraphics.setStrokeStyle({ color: this.changeElement.selectedColor, width: 2, cap: "round", join: "round"});
        this.changeElement.elementGraphics.stroke();

        if (final) {
            this.changeElement.pointsPenArray.push({x: this.endPointX, y: this.endPointY});
            this.changeElement.pointsPenArray.push({x: x2, y: y2});
            this.changeElement.pointsPenArray.push({x: x3, y: y3});
            this.changeElement.offsetPenX = this.changeElement.LeftCornerX;
            this.changeElement.offsetPenY = this.changeElement.LeftCornerY;
            this.changeElement.initialWidth = this.changeElement.RightCornerX - this.changeElement.LeftCornerX;
            this.changeElement.initialHeight = this.changeElement.RightCornerY - this.changeElement.LeftCornerY;
            this.changeElement.setSelectMode(final);
            this.changeElement.redrawGraphics();
        }
    }

    redrawRectElement (eventData, final) {
        let [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getNewCornersElement(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        this.setNewCornersElement(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
        if (Math.abs(rightCornerX - leftCornerX) >= this.minDiffToRect && Math.abs(rightCornerY - leftCornerY) >= this.minDiffToRect) {
            if (eventData.shiftKey) {
                const biggerSideSquare = Math.max(rightCornerX - leftCornerX, rightCornerY - leftCornerY);
                if (this.endPointX < this.startPointX) {
                    leftCornerX = rightCornerX - biggerSideSquare;
                } else {
                    rightCornerX = leftCornerX + biggerSideSquare;
                }
                if (this.endPointY < this.startPointY) {
                    leftCornerY = rightCornerY - biggerSideSquare;
                } else {
                    rightCornerY = leftCornerY + biggerSideSquare;
                }
                this.setNewCornersElement(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            }  
            if (final) {
                this.changeElement.setSelectMode(true);
                this.changeElement.redrawGraphics();
            } else {
                this.changeElement.setSelectMode(false);
                this.changeElement.redrawGraphics();
            }
        } else {
            if (final == true) {
                this.setNewCornersElement(
                    leftCornerX - this.defaultSquareSize/2, 
                    leftCornerY - this.defaultSquareSize/2, 
                    rightCornerX + this.defaultSquareSize/2, 
                    rightCornerY + this.defaultSquareSize/2);
                this.changeElement.setSelectMode(true);
                this.changeElement.redrawGraphics();
            }
        }
    }

    redrawEllipseElement (eventData, final) {
        let [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getNewCornersElement(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        this.setNewCornersElement(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
        if (Math.abs(rightCornerX - leftCornerX) >= this.minDiffToRect && Math.abs(rightCornerY - leftCornerY) >= this.minDiffToRect) {
            if (eventData.shiftKey) {
                const biggerSideSquare = Math.max(rightCornerX - leftCornerX, rightCornerY - leftCornerY);
                if (this.endPointX < this.startPointX) {
                    leftCornerX = rightCornerX - biggerSideSquare;
                } else {
                    rightCornerX = leftCornerX + biggerSideSquare;
                }
                if (this.endPointY < this.startPointY) {
                    leftCornerY = rightCornerY - biggerSideSquare;
                } else {
                    rightCornerY = leftCornerY + biggerSideSquare;
                }
                this.setNewCornersElement(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            }
            if (final) {
                this.changeElement.setSelectMode(true);
                this.changeElement.redrawGraphics();
            } else {
                this.changeElement.setSelectMode(false);
                this.changeElement.redrawGraphics();
            }
        } else {
            if (final == true) {
                this.setNewCornersElement(
                    leftCornerX - this.defaultEllipseRadius/2, 
                    leftCornerY - this.defaultEllipseRadius/2, 
                    rightCornerX + this.defaultEllipseRadius/2, 
                    rightCornerY + this.defaultEllipseRadius/2);
                this.changeElement.setSelectMode(true);
                this.changeElement.redrawGraphics();
            }
        }
    }

    redrawTextElement (final) {
        const [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getNewCornersElement(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        if (!final) {
            this.setNewCornersElement(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            if (Math.abs(rightCornerX - leftCornerX) >= this.minDiffToRect && Math.abs(rightCornerY - leftCornerY) >= this.minDiffToRect) {
                this.changeElement.setSelectMode(true);
                this.changeElement.redrawGraphics();
            } else {
                this.setNewCornersElement(
                    leftCornerX - this.defaultSquareSize/2, 
                    leftCornerY - this.defaultSquareSize/2, 
                    rightCornerX + this.defaultSquareSize/2, 
                    rightCornerY + this.defaultSquareSize/2);
                this.changeElement.setSelectMode(false);
                this.changeElement.redrawGraphics();
            }
        } else {
            if (Math.abs(rightCornerX - leftCornerX) >= this.minDiffToRect && Math.abs(rightCornerY - leftCornerY) >= this.minDiffToRect) {
                this.setNewCornersElement(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            } else {
                this.setNewCornersElement(
                    leftCornerX - this.defaultSquareSize/2, 
                    leftCornerY - this.defaultSquareSize/2, 
                    rightCornerX + this.defaultSquareSize/2, 
                    rightCornerY + this.defaultSquareSize/2);
            }
            this.changeElement.setSelectMode(true);
            this.changeElement.redrawGraphics();
            this.changeElement.redrawText();
        }
    }

    setNewCornersPen (xcurr, ycurr) {
        this.changeElement.LeftCornerX = (xcurr < this.changeElement.LeftCornerX) ? xcurr : this.changeElement.LeftCornerX;
        this.changeElement.LeftCornerY = (ycurr < this.changeElement.LeftCornerY) ? ycurr : this.changeElement.LeftCornerY;
        this.changeElement.RightCornerX = (xcurr > this.changeElement.RightCornerX) ? xcurr : this.changeElement.RightCornerX;
        this.changeElement.RightCornerY = (ycurr > this.changeElement.RightCornerY) ? ycurr : this.changeElement.RightCornerY;
    }

    getNewCornersElement (x1, y1, x2, y2) {
        const leftCornerX = Math.min(x1, x2);
        const leftCornerY = Math.min(y1, y2);
        const rightCornerX = Math.max(x1, x2);
        const rightCornerY = Math.max(y1, y2);
        return [leftCornerX, leftCornerY, rightCornerX, rightCornerY];
    }

    setNewCornersElement (leftCornerX, leftCornerY, rightCornerX, rightCornerY) {
        this.changeElement.LeftCornerX = leftCornerX;
        this.changeElement.LeftCornerY = leftCornerY;
        this.changeElement.RightCornerX = rightCornerX;
        this.changeElement.RightCornerY = rightCornerY;
    }
}