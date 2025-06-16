import { BitmapText, Point, Graphics } from 'pixi.js';
import Element from './element';

export default class DrawTool {
    toolName = null;
    editableElement = null;
    startPointX = null;
    startPointY = null;
    endPointX = null;
    endPointY = null;
    scaleMultiply = 1;

    drawMaxDistance = 5;
    defaultSquareSize = 50;
    defaultEllipseRadius = 50;

    constructor (toolNameString) {
        this.toolName = toolNameString;
    }

    setElement (eventData, color, scaleCanvas) {
        this.scaleMultiply = scaleCanvas;
        switch(this.toolName) {
            case 'penTool':
            case 'arrowTool':
                this.setStartPoint(eventData);
                this.setInitialElementGraphics(color);
                break;
            case 'rectTool':
            case 'textTool':
                this.setStartPoint(eventData);
                this.setInitialElementGraphics(color, this.startPointX, this.startPointY);
                break;
            case 'ellipseTool':
                this.setStartPoint(eventData);
                this.setInitialElementGraphics(color);
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

    setInitialElementGraphics (color, leftCornerX = null, leftCornerY = null) {
        this.editableElement = new Element(this.toolName, color);
        if (leftCornerX !== null && leftCornerY !== null) {
            this.editableElement.setPositionGraphics();
        } else {
            if (this.editableElement.elementType == 'pen' || this.editableElement.elementType == 'arrow') {
                this.editableElement.pointsArray.push({x: this.startPointX, y: this.startPointY});
                this.editableElement.elementGraphics.moveTo(this.startPointX, this.startPointY);
                this.editableElement.elementGraphics.setStrokeStyle({ color: this.editableElement.selectedColor, width: 2, cap: "round", join: "round"});
                this.editableElement.elementGraphics.stroke();

                this.editableElement.leftUpCornerX = this.startPointX;
                this.editableElement.leftUpCornerY = this.startPointY;
                this.editableElement.rightDownCornerX = this.startPointX;
                this.editableElement.rightDownCornerY = this.startPointY;
            }
        }
    }

    redrawElement (event, eventData, final, color) {
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
        this.setNewLinesCorners(this.endPointX, this.endPointY);
        this.editableElement.elementGraphics.setStrokeStyle({ color: this.editableElement.selectedColor, width: 2, cap: "round", join: "round"});
        this.editableElement.elementGraphics.stroke();
        this.editableElement.elementGraphics.moveTo(this.startPointX, this.startPointY);
        this.editableElement.elementGraphics.lineTo(this.endPointX, this.endPointY);
        this.editableElement.pointsArray.push({x: this.endPointX, y: this.endPointY});
        if (final) {
            this.editableElement.initialOffsetX = this.editableElement.leftUpCornerX;
            this.editableElement.initialOffsetY = this.editableElement.leftUpCornerY;
            this.editableElement.initialWidth = this.editableElement.rightDownCornerX - this.editableElement.leftUpCornerX;
            this.editableElement.initialHeight = this.editableElement.rightDownCornerY - this.editableElement.leftUpCornerY;
            this.editableElement.setSelectMode(final);
            this.editableElement.redrawGraphics();
        }
    }

    redrawArrowElement (final) {
        const [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getElementNewCorners(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        this.setElementNewCorners(leftCornerX, leftCornerY, rightCornerX, rightCornerY);

        this.editableElement.elementGraphics.clear();
        this.editableElement.elementGraphics.moveTo(this.startPointX, this.startPointY);
        this.editableElement.elementGraphics.lineTo(this.endPointX, this.endPointY);
        this.editableElement.elementGraphics.moveTo(this.endPointX, this.endPointY);
        const betta = Math.atan2(this.startPointY - this.endPointY, this.startPointX - this.endPointX);

        const x2 = this.endPointX + 10 * Math.cos(betta + Math.PI / 6);
        const y2 = this.endPointY + 10 * Math.sin(betta + Math.PI / 6);
        const x3 = this.endPointX + 10 * Math.cos(betta - Math.PI / 6);
        const y3 = this.endPointY + 10 * Math.sin(betta - Math.PI / 6);

        this.editableElement.elementGraphics.lineTo(x2, y2);
        this.editableElement.elementGraphics.moveTo(this.endPointX, this.endPointY);
        this.editableElement.elementGraphics.lineTo(x3, y3);
        this.editableElement.elementGraphics.setStrokeStyle({ color: this.editableElement.selectedColor, width: 2, cap: "round", join: "round"});
        this.editableElement.elementGraphics.stroke();

        if (final) {
            this.editableElement.pointsArray.push({x: this.endPointX, y: this.endPointY});
            this.editableElement.pointsArray.push({x: x2, y: y2});
            this.editableElement.pointsArray.push({x: x3, y: y3});
            this.editableElement.initialOffsetX = this.editableElement.leftUpCornerX;
            this.editableElement.initialOffsetY = this.editableElement.leftUpCornerY;
            this.editableElement.initialWidth = this.editableElement.rightDownCornerX - this.editableElement.leftUpCornerX;
            this.editableElement.initialHeight = this.editableElement.rightDownCornerY - this.editableElement.leftUpCornerY;
            this.editableElement.setSelectMode(final);
            this.editableElement.redrawGraphics();
        }
    }

    redrawRectElement (eventData, final) {
        let [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getElementNewCorners(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        this.setElementNewCorners(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
        if (Math.abs(rightCornerX - leftCornerX) >= this.drawMaxDistance && Math.abs(rightCornerY - leftCornerY) >= this.drawMaxDistance) {
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
                this.setElementNewCorners(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            }  
            if (final) {
                this.editableElement.setSelectMode(true);
                this.editableElement.redrawGraphics();
            } else {
                this.editableElement.setSelectMode(false);
                this.editableElement.redrawGraphics();
            }
        } else {
            if (final == true) {
                this.setElementNewCorners(
                    leftCornerX - this.defaultSquareSize/2, 
                    leftCornerY - this.defaultSquareSize/2, 
                    rightCornerX + this.defaultSquareSize/2, 
                    rightCornerY + this.defaultSquareSize/2);
                this.editableElement.setSelectMode(true);
                this.editableElement.redrawGraphics();
            }
        }
    }

    redrawEllipseElement (eventData, final) {
        let [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getElementNewCorners(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        this.setElementNewCorners(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
        if (Math.abs(rightCornerX - leftCornerX) >= this.drawMaxDistance && Math.abs(rightCornerY - leftCornerY) >= this.drawMaxDistance) {
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
                this.setElementNewCorners(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            }
            if (final) {
                this.editableElement.setSelectMode(true);
                this.editableElement.redrawGraphics();
            } else {
                this.editableElement.setSelectMode(false);
                this.editableElement.redrawGraphics();
            }
        } else {
            if (final == true) {
                this.setElementNewCorners(
                    leftCornerX - this.defaultEllipseRadius/2, 
                    leftCornerY - this.defaultEllipseRadius/2, 
                    rightCornerX + this.defaultEllipseRadius/2, 
                    rightCornerY + this.defaultEllipseRadius/2);
                this.editableElement.setSelectMode(true);
                this.editableElement.redrawGraphics();
            }
        }
    }

    redrawTextElement (final) {
        const [leftCornerX, leftCornerY, rightCornerX, rightCornerY] = this.getElementNewCorners(
            this.startPointX,
            this.startPointY,
            this.endPointX,
            this.endPointY
        );
        if (!final) {
            this.setElementNewCorners(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            if (Math.abs(rightCornerX - leftCornerX) >= this.drawMaxDistance && Math.abs(rightCornerY - leftCornerY) >= this.drawMaxDistance) {
                this.editableElement.setSelectMode(true);
                this.editableElement.redrawGraphics();
            } else {
                this.setElementNewCorners(
                    leftCornerX - this.defaultSquareSize/2, 
                    leftCornerY - this.defaultSquareSize/2, 
                    rightCornerX + this.defaultSquareSize/2, 
                    rightCornerY + this.defaultSquareSize/2);
                this.editableElement.setSelectMode(false);
                this.editableElement.redrawGraphics();
            }
        } else {
            if (Math.abs(rightCornerX - leftCornerX) >= this.drawMaxDistance && Math.abs(rightCornerY - leftCornerY) >= this.drawMaxDistance) {
                this.setElementNewCorners(leftCornerX, leftCornerY, rightCornerX, rightCornerY);
            } else {
                this.setElementNewCorners(
                    leftCornerX - this.defaultSquareSize/2, 
                    leftCornerY - this.defaultSquareSize/2, 
                    rightCornerX + this.defaultSquareSize/2, 
                    rightCornerY + this.defaultSquareSize/2);
            }
            this.editableElement.setSelectMode(true);
            this.editableElement.redrawGraphics();
            this.editableElement.redrawText();
        }
    }

    setNewLinesCorners (xcurr, ycurr) {
        this.editableElement.leftUpCornerX = (xcurr < this.editableElement.leftUpCornerX) ? xcurr : this.editableElement.leftUpCornerX;
        this.editableElement.leftUpCornerY = (ycurr < this.editableElement.leftUpCornerY) ? ycurr : this.editableElement.leftUpCornerY;
        this.editableElement.rightDownCornerX = (xcurr > this.editableElement.rightDownCornerX) ? xcurr : this.editableElement.rightDownCornerX;
        this.editableElement.rightDownCornerY = (ycurr > this.editableElement.rightDownCornerY) ? ycurr : this.editableElement.rightDownCornerY;
    }

    getElementNewCorners (x1, y1, x2, y2) {
        const leftCornerX = Math.min(x1, x2);
        const leftCornerY = Math.min(y1, y2);
        const rightCornerX = Math.max(x1, x2);
        const rightCornerY = Math.max(y1, y2);
        return [leftCornerX, leftCornerY, rightCornerX, rightCornerY];
    }

    setElementNewCorners (leftCornerX, leftCornerY, rightCornerX, rightCornerY) {
        this.editableElement.leftUpCornerX = leftCornerX;
        this.editableElement.leftUpCornerY = leftCornerY;
        this.editableElement.rightDownCornerX = rightCornerX;
        this.editableElement.rightDownCornerY = rightCornerY;
    }
}