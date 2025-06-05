import { use, useCallback, useEffect, useRef, useState } from 'react'

import { Application, Container, Graphics, BitmapText, BitmapFont, Rectangle, Point } from 'pixi.js';
import { HexColorPicker } from 'react-colorful';
import HeaderControlPanel from './common/headerControlPanel/HeaderControlPanel';
import ToolsPanel from './common/toolsPanel/ToolsPanel';
import Tool from './common/tools/tool';

import '../styles/BoardPage.css';
import OuterContainer from './common/tools/outerContainer';
import { useParams } from 'react-router-dom';

// подключение socket к компоненту
import { io } from 'socket.io-client';
import { socket } from './socket';

import { elementSchema, parseValueFromServer, convertDataFormDB, elementDBSchema, parseValueToServer, prepareObjectToServer } from './convertData';
import Element from './common/tools/element';

const Tools = Object.freeze({
   RECT: new Tool('rectTool'),
   SELECT: new Tool('selectTool'),
   MOVE: new Tool('moveTool'),
   SCALE: new Tool('scaleTool'),
   ELLIPSE: new Tool('ellipseTool'),
   DELETE: new Tool('deleteTool'),
   TEXT: new Tool('textTool'),
   PEN: new Tool('penTool'),
   ARROW: new Tool('arrowTool'),
});

const ColorTypes = Object.freeze({
    HASH_PREFIX: 'HASH',
    X_PREFIX: '0X',
    NO_PREFIX: 'NO',
});

const AllowedToolsToEditElements = [
    'selectTool',
    'moveTool',
    'scaleTool',
    'deleteTool',
    'textTool',
];

function BoardPage() {
    // const [socket, setSocket ] = useState(null);
    const [ username, setUsername ] = useState('');
    const [ textElementToDB, setTextElementToDB ] = useState(false);
    const [ elementsDB, setElementsDB ] = useState([]);
    const { boardId } = useParams();
    const PossibleTools = [
        new Tool('rectTool'),
        new Tool('selectTool'),
        new Tool('moveTool'),
        new Tool('scaleTool'),
        new Tool('ellipseTool'),
        new Tool('deleteTool'),
        new Tool('textTool'),
        new Tool('penTool'),
        new Tool('arrowTool'),
    ]
    const [ width, setWidth ] = useState(window.innerWidth / 1);
    const [ height, setHeight ] = useState(window.innerHeight / 1);
    const [ containerScale, setContainerScale ] = useState(1);
    const [ containerPosition, setContainerPosition ] = useState({
        x: 0,
        y: 0
    });
    const [ stageElements, setStageElements ] = useState([]);
    const [ selectTool, setSelectTool ] = useState(PossibleTools[1]);
    const [ selectElement, setSelectElement ] = useState(null);

    const [ color, setColor ] = useState("#A8CBFF");
    const [ textColor, setTextColor ] = useState("#A8CBFF");

    const [ showTextarea, setShowTextarea ] = useState(false);
    const [ showBackgroundColorPicker, setShowBackgroundColorPicker ] = useState(false);
    const [ showTextColorPicker, setShowTextColorPicker ] = useState(false);

    const [ textareaEditMode, setTextareaEditMode ] = useState(false);
    const [ textValue, setTextValue ] = useState("");
    const [ styleTextChange, setStyleTextChange ] = useState({
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '10px',
        height: '10px',
        fontFamily: 'Arial',
        fontSize: '24px'
    });
    const [ canvasLeftCorner, setCanvasLeftCorner ] = useState({
        x: 0,
        y: 0
    });

    const [outerContainer, setOuterContainer] = useState(new OuterContainer());

    useEffect(() => {
        function onConnect() {
            socket.emit('joinBoard', boardId);
        }

        socket.on('connect', onConnect);

        socket.on('joined', (boardId) => {
            console.log('Success join');
        });

        socket.on('connect_error', (err) => {
            console.log(err.message);
        });

        socket.emit('getBoardDataServer', boardId);

        socket.on('getBoardDataClient', (data) => {
            if(data) {
                const boardDataFromDB = Array.isArray(data) ? data : [data];
                let newSelectElements = [];
                let newGraphicsArray = [];
                boardDataFromDB.forEach(element => {
                    const newElementObject = convertDataFormDB([element], elementSchema);
                    const newElementClassObject = createNewElement(newElementObject[0]);
                    newGraphicsArray = [...newGraphicsArray, newElementClassObject];
                    const result = checkSelectElementFromDB(newElementClassObject);
                    if (result) {
                        newSelectElements = [...newSelectElements, newElementClassObject];
                    }
                });
                setElementsFromDB(newGraphicsArray);
                if (newSelectElements.length == 0) {
                    setSelectElementsFromDB(null);    
                } else {
                    setSelectElementsFromDB(newSelectElements);   
                }
            }
        });

        socket.on('recieveChanges', ({ elementId, updData }) => {
            const newElementFromDB = [updData];
            const newElementObject = convertDataFormDB(newElementFromDB, elementSchema);
            const newElementClassObject = createNewElement(newElementObject[0]);
            updateElementToStageFromDB(elementId, newElementClassObject);
        });

        socket.on('updDBError', ({ element }) => {
            const newElementFromDB = [element];
            const newElementObject = convertDataFormDB(newElementFromDB, elementSchema);
            const newElementClassObject = createNewElement(newElementObject[0]);
            updateElementToStageFromDB(newElementClassObject.elementId, newElementClassObject);
        });

        socket.on('getElementData', ({ element }) => {
            const newElementFromDB = [element];
            const newElementObject = convertDataFormDB(newElementFromDB, elementSchema);
            const newElementClassObject = createNewElement(newElementObject[0]);
            addElementToStageFromDB(newElementClassObject);
        });

        socket.on('deleteElement', (elementId) => {
            deleteElementToStageFromDB(elementId);
        });

        socket.on('addDBError', ({ message }) => {
            socket.emit('getBoardData', boardId);
        });

        socket.on('delDBError', ({ message }) => {
            socket.emit('getBoardData', boardId);
        });

        socket.connect();

        return () => {
            socket.off('getBoardDataClient');
            socket.off('recieveChanges');
            socket.off('getElementData');
            socket.off('deleteElement');
            socket.off('connect');
            socket.off('joined');
            socket.off('connect_error');
            socket.off('addDBError');
            socket.off('updDBError');
            socket.off('delDBError');
            socket.disconnect();
        }
    }, []);

    useEffect(() => {
        const currentUsername = localStorage.getItem('wbusername');
        if (currentUsername) setUsername(currentUsername);
    }, []);

    function createNewElement(elementData) {
        const newElementClassObject = new Element();
        newElementClassObject.LeftCornerX = elementData.LeftCornerX;
        newElementClassObject.LeftCornerY = elementData.LeftCornerY;
        newElementClassObject.RightCornerX = elementData.RightCornerX;
        newElementClassObject.RightCornerY = elementData.RightCornerY;
        newElementClassObject.owner = elementData.owner;
        newElementClassObject.type = elementData.type;
        newElementClassObject.selectedColor = elementData.selectedColor;
        newElementClassObject.selectedTextColor = elementData.selectedTextColor;
        newElementClassObject.selectedElement = elementData.selectedElement;
        newElementClassObject.offsetPenX = elementData.offsetPenX;
        newElementClassObject.offsetPenY = elementData.offsetPenY;
        newElementClassObject.textString = elementData.textString;
        newElementClassObject.allowText = elementData.allowText;
        newElementClassObject.pointsPenArray = [...elementData.pointsPenArray];
        newElementClassObject.scalePenX = elementData.scalePenX;
        newElementClassObject.scalePenY = elementData.scalePenY;
        newElementClassObject.initialWidth = elementData.initialWidth;
        newElementClassObject.initialHeight = elementData.initialHeight;
        newElementClassObject.elementId = elementData.elementId;
        if (elementData.owner === 'null') {
            newElementClassObject.owner = null;
        }

        if (elementData.type == "text") {
            newElementClassObject.elementGraphics = new BitmapText();
        }

        return newElementClassObject;
    }

    function deleteElementToStageFromDB(elementDataId) {
        setStageElements(prevElements => prevElements.filter(element => element.elementId !== elementDataId));
    }

    function updateElementToStageFromDB(newElementDataId, newElementData) {
        setStageElements(prevElements => {
            const newElements = prevElements.map(element => element.elementId == newElementData.elementId ? newElementData : element);
            return newElements;
        });
    }

    function addElementToStageFromDB(newElementData) {
        setStageElements(prevElements => [...prevElements, newElementData]);
    }

    function setElementsFromDB(newElementDataArray) {
        const newArray = [...newElementDataArray];
        setStageElements(newArray);
    }

    function setSelectElementsFromDB(newElementDataArray) {
        if (newElementDataArray) {
            const newArray = [...newElementDataArray];
            setSelectElement(newArray);    
        } else {
            setSelectElement(null);
        }
    }

    function checkSelectElementFromDB(newElementClassObject) {
        if (newElementClassObject.selectedElement && newElementClassObject.owner == localStorage.getItem('wbusername')) {
            return true;
        } else {
            return false;
        }
    }

    useEffect(() => {
        const handleRezise = () => {
            setWidth(window.innerWidth / 1);
            setHeight(window.innerHeight / 1);
        }

        const handlePreventContextMenu = (event) => {
            event.preventDefault();
        };

        window.addEventListener('resize', handleRezise);
        window.addEventListener('contextmenu', handlePreventContextMenu);

        return () => {
            window.removeEventListener('resize', handleRezise);
            window.removeEventListener('contextmenu', handlePreventContextMenu);
        }
    }, []);

    const updateElementSocket = (elementId, updDataFront) => {
        const updData = prepareObjectToServer(updDataFront, elementDBSchema);
        socket.emit('changeElementBoard', { boardId, elementId, updData });
    }

    const addElementSocket = (addData) => {
        const elementData = prepareObjectToServer(addData, elementDBSchema);
        socket.emit('addElementBoard', { boardId, elementData });
    }

    const deleteElementSocket = (elementId) => {
        socket.emit('deleteElementBoard', { boardId, elementId });
    };

    useEffect(() => {
        if (selectElement !== null) {
            if (selectElement.length == 1) {
                if ((selectElement[0].type == 'text' || selectElement[0].type == 'rect') && textareaEditMode) {
                    handleSetStyleTextChange();
                    setShowTextarea(true);
                    const selectedElementIndex = findGraphicsInArray(stageElements, selectElement[0].elementGraphics);
                    const newGraphicsArray = getNewGraphicsArray('update', selectElement[0], selectedElementIndex);
                    handleSetStageElements(newGraphicsArray);
                }
            }
        }
    }, [textareaEditMode])

    const canvasRef = useRef(null);

    const init = useCallback(async() => {
        const canvas = canvasRef.current
        const app = new Application()
        await app.init({ width , height, antialias: true, canvas, background: 'D9D9D9'});
        return app
    }, [])

    const handleSetStageElements = (newCanvasElements) => {
        const currentCanvasElements = [...newCanvasElements];
        setStageElements(currentCanvasElements);
    }

    const handleSetColor = (newColor) => {
        const newColorNumber = parseInt(newColor.slice(1), 16);
        if (selectElement !== null) {
            selectElement.forEach((selElem) => {
                selElem.selectedColor = newColorNumber;
                selElem.redrawGraphics();
                updateElementSocket(selElem.elementId, selElem);
            })
        }
        setColor(newColor);
    }

    const handleSetTextColor = (newColor) => {
        const newColorNumber = parseInt(newColor.slice(1), 16);
        if (selectElement !== null) {
            selectElement.forEach((selElem) => {
                selElem.selectedTextColor = newColorNumber;
                selElem.redrawGraphics();
                updateElementSocket(selElem.elementId, selElem);
            })
        }
        setTextColor(newColor);
    }

    const handleChangeText = (event) => {
        if (selectElement !== null) {
            setTextValue(event.target.value);
        }
    }

    const handleFinishChangeText = (event) => {
        if ((selectElement !== null) && (showTextarea)) {
            setShowTextarea(false);
            setTextareaEditMode(false);
            const selectedElementIndex = findGraphicsInArray(stageElements, selectElement[0].elementGraphics);
            selectElement[0].textString = textValue;
            if (selectElement[0].textString !== '') {
                selectElement[0].allowText = true;
            } else {
                selectElement[0].allowText = false;
            }
            selectElement[0].redrawGraphics();
            setTextValue("");
            const newOuterContainer = new OuterContainer();
            newOuterContainer.addElement(selectElement[0]);

            if (textElementToDB) {
                selectElement[0].owner = username;
                addElementSocket(selectElement[0]);
                setTextElementToDB(false);
            }

            const newGraphicsArray = getNewGraphicsArray('update', stageElements[selectedElementIndex], selectedElementIndex);
            handleSetStageElements(newGraphicsArray);
            setOuterContainer(newOuterContainer);
        }
    }

    function getNewGraphicsArray (mode, currentElement, index = null) {
        let newGraphicsArray = [...stageElements];
        if (mode == 'add') {
            newGraphicsArray.push(currentElement);
        }
        if (mode == 'update') {
            if (index !== null) {
                newGraphicsArray[index] = currentElement;
            }
        }
        return newGraphicsArray
    }

    function getNewArrayGraphicsDelete (currentGraphics, ind) {
        let newGraphicsArray = [...currentGraphics];
        newGraphicsArray.splice(ind, 1);
        return newGraphicsArray;
    }

    function findGraphicsInArray (inputArray, elementSearch) {
        const elementIndex = inputArray.findIndex((element) => element.elementGraphics === elementSearch);
        return elementIndex;
    }

    const handleClickTools = (newSelectTool) => {
        switch(newSelectTool) {
            case 'rectTool':
                setSelectTool(PossibleTools[0]);
                break;
            case 'selectTool':
                setSelectTool(PossibleTools[1]);
                break;
            case 'moveTool':
                setSelectTool(PossibleTools[2]);
                break;
            case 'scaleTool':
                setSelectTool(PossibleTools[3]);
                break;
            case 'ellipseTool':
                setSelectTool(PossibleTools[4]);
                break;
            case 'deleteTool':
                setSelectTool(PossibleTools[5]);
                break;
            case 'textTool':
                setSelectTool(PossibleTools[6]);
                break;
            case 'penTool':
                setSelectTool(PossibleTools[7]);
                break;
            case 'arrowTool':
                setSelectTool(PossibleTools[8]);
                break;
        }
    }

    const handleColorPicker = () => {
        switch(selectTool.toolName) {
            case 'rectTool':
                if (!showBackgroundColorPicker) {
                    setShowBackgroundColorPicker(true);
                }
                if (!showTextColorPicker) {
                    setShowTextColorPicker(true);
                }
                break;
            case 'selectTool':
            case 'moveTool':
            case 'scaleTool':
                if (showBackgroundColorPicker) {
                    setShowBackgroundColorPicker(false);
                }
                if (showTextColorPicker) {
                    setShowTextColorPicker(false);
                }
                break;
            case 'ellipseTool':
            case 'penTool':
            case 'arrowTool':
                if (!showBackgroundColorPicker) {
                    setShowBackgroundColorPicker(true);
                }
                if (showTextColorPicker) {
                    setShowTextColorPicker(false);
                }
                break;
            case 'textTool':
                if (showBackgroundColorPicker) {
                    setShowBackgroundColorPicker(false);
                }
                if (!showTextColorPicker) {
                    setShowTextColorPicker(true);
                }
                break;
        }
    }

    const handleClickControlPanel = (newControlEvent) => {
        switch(newControlEvent) {
            case 'downScale':
                if (containerScale > 0.2) {
                    setContainerScale(containerScale - 0.1);
                }
                break;
            case 'upScale':
                if (containerScale < 2) {
                    setContainerScale(containerScale + 0.1);
                }
                break;
        }
    }

    const handleSetStyleTextChange = () => {
        let newTextChangeStyle;
        const globalPoint = selectElement[0].elementGraphics.getGlobalPosition();
        if (selectElement[0].type == 'rect') {
            newTextChangeStyle = {
                backgroundColor: `#${selectElement[0].selectedColor.toString(16).padStart(6, '0').toUpperCase()}`,
                color: `#${selectElement[0].selectedTextColor.toString(16).padStart(6, '0').toUpperCase()}`,
                resize: 'none',
                outline: 'none',
                position: 'absolute',
                left: `${globalPoint.x + selectElement[0].textMargin * containerScale + canvasLeftCorner.x}px`,
                top: `${globalPoint.y + selectElement[0].textMargin * containerScale + canvasLeftCorner.y}px`,
                width: `${(selectElement[0].RightCornerX - selectElement[0].LeftCornerX - 2.5 * selectElement[0].textMargin) * containerScale}px`,
                height: `${(selectElement[0].RightCornerY - selectElement[0].LeftCornerY - 2.5 * selectElement[0].textMargin) * containerScale}px`,
                fontFamily: 'Arial',
                fontSize: '24px'
            }
        } else {
            newTextChangeStyle = {
                backgroundColor: `#D9D9D9`,
                color: `#${selectElement[0].selectedTextColor.toString(16).padStart(6, '0').toUpperCase()}`,
                resize: 'none',
                outline: 'none',
                position: 'absolute',
                left: `${globalPoint.x + canvasLeftCorner.x}px`,
                top: `${globalPoint.y + canvasLeftCorner.y}px`,
                width: `${(selectElement[0].RightCornerX - selectElement[0].LeftCornerX) * containerScale}px`,
                height: `${(selectElement[0].RightCornerY - selectElement[0].LeftCornerY) * containerScale}px`,
                fontFamily: 'Arial',
                fontSize: '24px'
            }
        }
        setStyleTextChange(newTextChangeStyle);
    }

    useEffect(() => {
        const cameraContainer = new Container();
        cameraContainer.interactive = true;
        cameraContainer.label = 'cameraContainer';
        const GraphicsColor = parseInt(color.substring(1), 16);
        const GraphicsTextColor = parseInt(textColor.substring(1), 16);
        const app = init();

        const resizeCanvas = () => {
            app.then((app) => {
                app.renderer.resize(width, height);
                let canvasCoordinates = app.canvas.getBoundingClientRect();
                let newCanvasCoord = {
                    x: canvasCoordinates.left,
                    y: canvasCoordinates.top
                }
                setCanvasLeftCorner(newCanvasCoord);
            });
        };
        resizeCanvas();

        function updateStageChild (currentGraphics, deleteMode = false) {
            if (currentGraphics instanceof OuterContainer) {
                cameraContainer.removeChild(currentGraphics.mainContainer);
                cameraContainer.addChild(currentGraphics.mainContainer);
            } else {
                if (currentGraphics.elementGraphics !== null) {
                    cameraContainer.removeChild(currentGraphics.elementGraphics);    
                }
                if (!deleteMode) {
                    cameraContainer.addChild(currentGraphics.elementGraphics);    
                }
            }
        }

        const handlerClickElement = (event) => {
            if (selectTool.toolName == 'selectTool' && !showTextarea) {
                const selectedElementIndex = findGraphicsInArray(stageElements, event.target);
                if (!stageElements[selectedElementIndex].selectedElement) {
                    if (event.shiftKey) {
                        selectTool.allowSelection = true;
                        Tools.SELECT.selectProccessing(stageElements[selectedElementIndex], true);
                        stageElements[selectedElementIndex].owner = username;
                        // здесь - вызов функции с изменением элемента
                        updateElementSocket(stageElements[selectedElementIndex].elementId, stageElements[selectedElementIndex]);
                        outerContainer.addElement(stageElements[selectedElementIndex]);
                        setOuterContainer(outerContainer);
                        const newSelectElement = [...selectElement, stageElements[selectedElementIndex]];
                        setSelectElement(newSelectElement);
                    } else {
                        selectTool.allowSelection = true;
                        const newOuterContainer = new OuterContainer();
                        if (selectElement !== null) {
                            selectElement.forEach((selElem) => {
                                Tools.SELECT.selectProccessing(selElem, false);
                                selElem.elementGraphics.label = null;
                                selElem.owner = null;
                                // здесь - вызов функции с изменением элемента
                                updateElementSocket(selElem.elementId, selElem);
                            })
                        }
                        Tools.SELECT.selectProccessing(stageElements[selectedElementIndex], true);
                        stageElements[selectedElementIndex].owner = username;
                        // здесь - вызов функции с изменением элемента
                        updateElementSocket(stageElements[selectedElementIndex].elementId, stageElements[selectedElementIndex]);
                        newOuterContainer.addElement(stageElements[selectedElementIndex]);
                        setOuterContainer(newOuterContainer);
                        const newSelectElement = [stageElements[selectedElementIndex]];
                        setSelectElement(newSelectElement);
                    }
                }
            }
        }

        const handlerCanvasElementPointerDown = (event) => {
            if (AllowedToolsToEditElements.includes(selectTool.toolName) && (event.button == 0)) {
                setGlobalToLocal(event);
                selectTool.startProccessing(event, null, outerContainer);
                
                if (selectTool.toolName == 'selectTool') {
                    selectTool.mouseDown = true;
                }
            }
        };

        app.then((app) => {
            app.stage.label = "mainStage";
            app.stage.addChild(cameraContainer);
            if (outerContainer.mainContainer.destroyed) {
                outerContainer.mainContainer = new Container();
                outerContainer.mainContainer.sortableChildren = true;
                outerContainer.mainContainer.label = "outerContainer";
                outerContainer.calcStroke();
                outerContainer.calcSquares();
                outerContainer.xCoordinates.clear();
                outerContainer.yCoordinates.clear();
            }
            outerContainer.elementsIds = [];
            stageElements.forEach((stageElement) => {
                if (stageElement.selectedElement && username == stageElement.owner) {
                    outerContainer.addElement(stageElement);
                    outerContainer.elementsIds.push(stageElement.elementId);
                }
            });
            if (outerContainer.mainContainer.children.length > 5) {
                outerContainer.mainContainer.interactive = true;
                outerContainer.mainContainer.eventMode = 'static';
                outerContainer.setInteractive();
                outerContainer.fillOuterElements();
                outerContainer.mainContainer.on('mousedown', handlerCanvasElementPointerDown);
                cameraContainer.addChild(outerContainer.mainContainer);
            } else {
                handleColorPicker();
            }
            stageElements.forEach((stageElement) => {
                const stageElementColor = stageElement.selectedColor;
                if (username !== stageElement.owner && (stageElement.owner !== null)) {
                    stageElement.setOwnerTextGraphics();
                    stageElement.redrawBusyGraphics();
                    cameraContainer.addChild(stageElement.ownerTextGraphics);
                } else {
                    stageElement.redrawGraphics();
                }
                if (stageElement.type !== 'text') {
                    stageElement.elementGraphics.fill({color: stageElementColor, alpha: 0.5});
                }
                stageElement.elementGraphics.interactive = true;
                if (!stageElement.selectedElement || (stageElement.selectedElement && username !== stageElement.owner)) {
                    stageElement.elementGraphics.on('mousedown', handlerClickElement);
                    stageElement.elementGraphics.eventMode = 'static';
                    if (stageElement.type == 'pen' || stageElement.type == 'arrow') {
                        const globalPoint =  new Point(stageElement.LeftCornerX, stageElement.LeftCornerY);
                        const localPoint = stageElement.elementGraphics.toLocal(globalPoint, cameraContainer);
                        stageElement.setHitArea(localPoint);
                    } else {
                        stageElement.setHitArea();
                    }
                    cameraContainer.addChild(stageElement.elementGraphics);

                    if (stageElement.type == 'rect' && stageElement.allowText) {
                        stageElement.setPositionInnerText();
                        cameraContainer.addChild(stageElement.innerTextGraphics);
                    }
                } else {
                    if (username == stageElement.owner) {
                        if (!showBackgroundColorPicker) {
                            if (stageElement.type == 'ellipse' || stageElement.type == 'rect' || stageElement.type == 'pen' || stageElement.type == 'arrow') {
                                setShowBackgroundColorPicker(true);
                            }
                        }
                        if (!showTextColorPicker) {
                            if (stageElement.type == 'text' || (stageElement.type == 'rect' && stageElement.allowText)) {
                                setShowTextColorPicker(true);
                            }
                        }
                        stageElement.setPositionAsSelected(outerContainer.LeftCornerX, outerContainer.LeftCornerY);
                    }
                }
            });
            if (selectTool.toolName == 'deleteTool') {
                if (selectElement !== null) {
                    let newGraphicsArray = [...stageElements];
                    let selectedElementInd;
                    selectElement.forEach((selElem) => {
                        updateStageChild(selElem, true);
                        selectedElementInd = findGraphicsInArray(newGraphicsArray, selElem.elementGraphics);
                        newGraphicsArray = getNewArrayGraphicsDelete(newGraphicsArray, selectedElementInd);
                        outerContainer.removeElement(selElem);
                        deleteElementSocket(selElem.elementId);
                    });
                    outerContainer.LeftCornerX = null;
                    outerContainer.LeftCornerY = null;
                    outerContainer.RightCornerX = null;
                    outerContainer.RightCornerY = null;
                    outerContainer.containerWidth = null;
                    outerContainer.containerHeight = null;
                    handleSetStageElements(newGraphicsArray);
                    setSelectElement(null);
                    setSelectTool(PossibleTools[1]);
                }
                setSelectTool(PossibleTools[1]);
            } else {
                cameraContainer.scale.set(containerScale, containerScale);
                cameraContainer.position.x = containerPosition.x - (containerScale - 1) * width;
                cameraContainer.position.y = containerPosition.y - (containerScale - 1) * height;
                app.stage.hitArea = app.screen;
                selectTool.scaleCanvas = containerScale;
            }
        })

        window.addEventListener('resize', resizeCanvas);

        function setGlobalToLocal(event) {
            const globalPoint = event.global;
            const localPoint = cameraContainer.toLocal(globalPoint);
            selectTool.currentLocalPoint.x = localPoint.x;
            selectTool.currentLocalPoint.y = localPoint.y;
        }

        const handleMouseDown = (event) => {
            if (!showTextarea) {
                if (!(AllowedToolsToEditElements.includes(selectTool.toolName)) || selectTool.toolName == 'textTool') {
                    if (selectElement !== null) {
                        selectElement.forEach((selElem) => {
                            Tools.SELECT.selectProccessing(selElem, false);
                            selElem.elementGraphics.label = null;
                            selElem.owner = null;
                            // здесь - вызов функции с изменением элемента
                            updateElementSocket(selElem.elementId, selElem);
                        })
                        const newOuterContainer = new OuterContainer();
                        setOuterContainer(newOuterContainer);
                    }
                    setGlobalToLocal(event);
                    if (selectTool.toolName == 'textTool') {
                        selectTool.startProccessing(event, GraphicsTextColor);
                    } else {
                        selectTool.startProccessing(event, GraphicsColor);
                    }
                    selectTool.mouseDown = true;
                    const newSelectElement = [selectTool.tool.changeElement];
                    setSelectElement(newSelectElement);
                } else {
                    if (selectTool.allowSelection) {
                        selectTool.allowSelection = false;
                    } else {
                        selectTool.mouseDown = true;
                    }
                }   
            }
        };

        const handleRightDown = (event) => {
            event.stopPropagation();
            if (selectTool.toolName == 'selectTool') {
                setGlobalToLocal(event);
                selectTool.startProccessing(event);
                selectTool.mouseDown = true;
            }
        }

        const handleRightUp = (event) => {
            event.stopPropagation();
            if ((selectTool.toolName == 'selectTool') && (selectTool.mouseDown == true)) {
                selectTool.mouseDown = false;
                setGlobalToLocal(event);
                selectTool.redrawProccessing(event, cameraContainer);
                setContainerPosition({
                    x: cameraContainer.position.x,
                    y: cameraContainer.position.y,
                })
            }
        }

        const handleMouseMove = (event) => {
            if (!(AllowedToolsToEditElements.includes(selectTool.toolName)) || selectTool.toolName == 'textTool') {
                if (selectTool.mouseDown == true) {
                    setGlobalToLocal(event);
                    selectTool.redrawProccessing(event, selectElement[0]);
                    const newGraphics = selectTool.tool.changeElement;
                    updateStageChild(newGraphics);
                }
            } else {
                if (event.buttons == 2) {
                    if ((selectTool.toolName == 'selectTool') && (selectTool.mouseDown == true)) {
                        setGlobalToLocal(event);
                        selectTool.redrawProccessing(event, cameraContainer);
                    }
                } else {
                    if ((selectTool.mouseDown == true) && (outerContainer.mainContainer.children.length > 5)) {
                        if (selectElement !== null) {
                            setGlobalToLocal(event);
                            selectTool.redrawProccessing(event, outerContainer);
                        }
                    }
                }
            }
        };

        const handleMouseUp = (event) => {
            if (!(AllowedToolsToEditElements.includes(selectTool.toolName)) || selectTool.toolName == 'textTool') {
                if (selectTool.mouseDown == true) {
                    selectTool.mouseDown = false;
                    setGlobalToLocal(event);
                    selectTool.redrawProccessing(event, selectElement[0], true);

                    if (selectElement) {
                        selectElement.forEach((selElem) => {
                            selElem.owner = null;
                        })
                    }

                    const newOuterContainer = new OuterContainer();
                    newOuterContainer.addElement(selectElement[0]);

                    if (selectTool.toolName == 'textTool'){
                        setTextElementToDB(true);
                    } else {
                        selectElement[0].owner = username;
                        addElementSocket(selectElement[0]);
                    }

                    setOuterContainer(newOuterContainer);

                    selectElement.forEach((selElem) => {
                        updateStageChild(selElem, true);    
                    })

                    let newGraphicsArray = [];
                    if (selectTool.toolName == 'textTool') {
                        setTextareaEditMode(true);
                    }
                    selectElement.forEach((selElem) => {
                        newGraphicsArray = getNewGraphicsArray('add', selElem);
                    })
                    handleSetStageElements(newGraphicsArray);
                }
            } else {
                if ((selectTool.toolName == 'selectTool') && (event.button == 0)) {
                    if (selectTool.mouseDown == true) {
                        if (!selectTool.tool.allowChange) {
                            selectTool.mouseDown = false;
                            if (event.target.label == "mainStage") {
                                if (selectElement !== null) {
                                    selectElement.forEach((selElem) => {
                                        Tools.SELECT.selectProccessing(selElem, false);
                                        selElem.elementGraphics.label = null;
                                        selElem.owner = null;
                                        updateElementSocket(selElem.elementId, selElem);
                                    })
                                    const newOuterContainer = new OuterContainer();
                                    setOuterContainer(newOuterContainer);
                                    setSelectElement(null);
                                }
                                return;
                            }
                            if (selectElement !== null) {
                                if (selectTool.allowSelection !== true) {
                                    if (selectElement.length == 1 && selectElement[0].type == 'text' && event.target.label == 'selectedElement') {
                                        setTextValue(selectElement[0].textString);
                                        setTextareaEditMode(true);
                                        return;
                                    }
                                    if (selectElement.length == 1 && selectElement[0].type == 'rect' && event.target.label == 'selectedElement') {
                                        setTextValue(selectElement[0].textString);
                                        setTextareaEditMode(true);
                                        return;
                                    }
                                } else {
                                    selectTool.allowSelection = false;
                                }
                            }
                            const selectedElementIndex = findGraphicsInArray(stageElements, event.target);
                            if (event.shiftKey) {
                                if (event.target.label !== "outerContainer") {
                                    const selectedElementIndexInArray = findGraphicsInArray(selectElement, event.target);
                                    if (selectElement.length !== 1) {
                                        outerContainer.removeElement(stageElements[selectedElementIndex]);
                                        outerContainer.removeCoordinates(selectElement[selectedElementIndexInArray]);
                                        setOuterContainer(outerContainer);                                
                                    } else {
                                        const newOuterContainer = new OuterContainer();
                                        setOuterContainer(newOuterContainer);
                                    }
                                    const newSelectElement = [...selectElement];
                                    newSelectElement.splice(selectedElementIndexInArray, 1);
                                    setSelectElement(newSelectElement);
                                    let newGraphicsArray = [];
                                    Tools.SELECT.selectProccessing(stageElements[selectedElementIndex], false);
                                    newGraphicsArray = getNewGraphicsArray('update', stageElements[selectedElementIndex], selectedElementIndex);
                                    stageElements[selectedElementIndex].owner = null;
                                    updateElementSocket(stageElements[selectedElementIndex].elementId, stageElements[selectedElementIndex]);
                                    handleSetStageElements(newGraphicsArray);
                                }
                            } else {
                                if (event.target.label !== "outerContainer") {
                                    if (event.target.label !== 'LeftUp' && event.target.label !== 'LeftDown' && event.target.label !== 'RightUp' && event.target.label !== 'RightDown' && event.target.label !== 'mainStage') {
                                        const newOuterContainer = new OuterContainer();
                                        selectElement.forEach((selElem) => {
                                            Tools.SELECT.selectProccessing(selElem, false);
                                            selElem.elementGraphics.label = null;
                                            selElem.owner = null;
                                            updateElementSocket(selElem.elementId, selElem);
                                        })
                                        Tools.SELECT.selectProccessing(stageElements[selectedElementIndex], true);
                                        stageElements[selectedElementIndex].owner = username;
                                        updateElementSocket(stageElements[selectedElementIndex].elementId, stageElements[selectedElementIndex]);
                                        newOuterContainer.addElement(stageElements[selectedElementIndex]);
                                        setOuterContainer(newOuterContainer);
                                        const newSelectElement = [stageElements[selectedElementIndex]];
                                        setSelectElement(newSelectElement);
                                    }
                                }
                            }
                        }
                        if (selectElement !== null && selectTool.tool.allowChange) {
                            selectTool.tool.allowChange = false;
                            selectTool.mouseDown = false;
                            setGlobalToLocal(event);
                            selectTool.redrawProccessing(event, outerContainer, true);
                            let newGraphicsArray = [];
                            let selectedElementIndex;
                            if (outerContainer.lastMoveDiffX && outerContainer.lastMoveDiffY && selectTool.tool.transformType == 'moving') {
                                selectElement.forEach((selElem) => {
                                    selElem.LeftCornerX += outerContainer.lastMoveDiffX;
                                    selElem.LeftCornerY += outerContainer.lastMoveDiffY;
                                    selElem.RightCornerX += outerContainer.lastMoveDiffX;
                                    selElem.RightCornerY += outerContainer.lastMoveDiffY;
                                    selectedElementIndex = findGraphicsInArray(stageElements, selElem.elementGraphics);
                                    newGraphicsArray = getNewGraphicsArray('update', selElem, selectedElementIndex);
                                    updateElementSocket(selElem.elementId, selElem);
                                })
                                outerContainer.lastMoveDiffX = null;
                                outerContainer.lastMoveDiffY = null;
                            }
                            if (outerContainer.lastScaleX && outerContainer.lastScaleY && selectTool.tool.transformType == 'scaling') {
                                outerContainer.xCoordinates.clear();
                                outerContainer.yCoordinates.clear();
                                selectElement.forEach((selElem) => {
                                    let oldHeight = selElem.RightCornerY - selElem.LeftCornerY;
                                    let oldWidth = selElem.RightCornerX - selElem.LeftCornerX;
                                    let percentX = ((selElem.LeftCornerX - (outerContainer.LeftCornerX - outerContainer.lastMoveDiffX)) / selectTool.tool.startWidth).toFixed(2);
                                    let percentY = ((selElem.LeftCornerY - (outerContainer.LeftCornerY - outerContainer.lastMoveDiffY)) / selectTool.tool.startHeight).toFixed(2);
                                    selElem.LeftCornerX = outerContainer.LeftCornerX + percentX * outerContainer.containerWidth;
                                    selElem.LeftCornerY = outerContainer.LeftCornerY + percentY * outerContainer.containerHeight;
                                    selElem.RightCornerX = selElem.LeftCornerX + oldWidth * outerContainer.lastScaleX;
                                    selElem.RightCornerY = selElem.LeftCornerY + oldHeight * outerContainer.lastScaleY;
                                    if (selElem.type == 'pen' || selElem.type == 'arrow') {
                                        if (selElem.LeftCornerX > selElem.RightCornerX) {
                                            if (selElem.scalePenX < 0) {
                                                selElem.scalePenX = (Math.abs(selElem.RightCornerX - selElem.LeftCornerX) /selElem.initialWidth).toFixed(2);
                                            } else {
                                                selElem.scalePenX = - (Math.abs(selElem.RightCornerX - selElem.LeftCornerX) /selElem.initialWidth).toFixed(2);
                                            }
                                        } else {
                                            if (selElem.scalePenX < 0) {
                                                selElem.scalePenX = - (Math.abs(selElem.RightCornerX - selElem.LeftCornerX) /selElem.initialWidth).toFixed(2);
                                            } else {
                                                selElem.scalePenX = (Math.abs(selElem.RightCornerX - selElem.LeftCornerX) /selElem.initialWidth).toFixed(2);
                                            }
                                        }
                                        if (selElem.LeftCornerY > selElem.RightCornerY) {
                                            if (selElem.scalePenY < 0) {
                                                selElem.scalePenY = (Math.abs(selElem.RightCornerY - selElem.LeftCornerY) /selElem.initialHeight).toFixed(2);
                                            } else {
                                                selElem.scalePenY = - (Math.abs(selElem.RightCornerY - selElem.LeftCornerY) /selElem.initialHeight).toFixed(2);
                                            }
                                        } else {
                                            if (selElem.scalePenY < 0) {
                                                selElem.scalePenY = - (Math.abs(selElem.RightCornerY - selElem.LeftCornerY) /selElem.initialHeight).toFixed(2);
                                            } else {
                                                selElem.scalePenY = (Math.abs(selElem.RightCornerY - selElem.LeftCornerY) /selElem.initialHeight).toFixed(2);
                                            }
                                        }
                                    }

                                    let varForChangeOne;
                                    if (selElem.LeftCornerX > selElem.RightCornerX) {
                                        varForChangeOne = selElem.RightCornerX;
                                        selElem.RightCornerX = selElem.LeftCornerX;
                                        selElem.LeftCornerX = varForChangeOne;
                                    }

                                    if (selElem.LeftCornerY > selElem.RightCornerY) {
                                        varForChangeOne = selElem.RightCornerY;
                                        selElem.RightCornerY = selElem.LeftCornerY;
                                        selElem.LeftCornerY = varForChangeOne;
                                    }
                                    outerContainer.addElementCoordinates(selElem.LeftCornerX, selElem.LeftCornerY);
                                    outerContainer.addElementCoordinates(selElem.RightCornerX, selElem.RightCornerY);
                                    selectedElementIndex = findGraphicsInArray(stageElements, selElem.elementGraphics);
                                    newGraphicsArray = getNewGraphicsArray('update', selElem, selectedElementIndex);
                                    updateElementSocket(selElem.elementId, selElem);
                                })
                                selectTool.tool.startHeight = null;
                                selectTool.tool.startWidth = null;
                                outerContainer.setNewCornersAddElement();
                                outerContainer.lastScaleX = null;
                                outerContainer.lastScaleY = null;
                                outerContainer.lastMoveDiffX = null;
                                outerContainer.lastMoveDiffY = null;
                                outerContainer.mainContainer.scale.set(1, 1);
                                outerContainer.setElementsScales(1, 1);
                            }
                            handleSetStageElements(newGraphicsArray);
                        }
                    }
                }
            }
        }

        app.then((app) => {
            app.stage.interactive = true;
            app.stage.hitArea = app.screen;

            app.stage.on('mousedown', handleMouseDown);
            app.stage.on('mousemove', handleMouseMove);
            app.stage.on('mouseup', handleMouseUp);
            app.stage.on('rightdown', handleRightDown);
            app.stage.on('rightup', handleRightUp);
        })

        const destroyAllGraphics = (stage) => {
            const graphicsToDestroy = [];

            stage.children.forEach((child) => {
                if (child instanceof Graphics) {
                    graphicsToDestroy.push(child);
                }
            });

            graphicsToDestroy.forEach((graphics) => {
                stage.removeChild(graphics);
                graphics.destroy();
            });
        }

        return async() => {
            window.removeEventListener('resize', resizeCanvas);
            stageElements.forEach((stageElement) => {
                stageElement.elementGraphics.off('mousedown', handlerClickElement);
            });
            outerContainer.mainContainer.off('mousedown', handlerCanvasElementPointerDown);
            outerContainer.mainContainer.destroy();
            (await app).stage.off('mousedown', handleMouseDown);
            (await app).stage.off('mousemove', handleMouseMove);
            (await app).stage.off('mouseup', handleMouseUp);
            (await app).stage.off('rightdown', handleRightDown);
            (await app).stage.off('rightup', handleRightUp);
            destroyAllGraphics(cameraContainer);
            (await app).stop();
        };
    }, [init, width, height, selectTool, stageElements, color, textColor, selectElement, containerScale])

    return (
        <>
            <HeaderControlPanel onClick={handleClickControlPanel}/>
            <ToolsPanel onClick={handleClickTools} selectedTool={selectTool.toolName}/>
            {showBackgroundColorPicker && <div><div className='board-color-title-bckg-up'><p className='board-color-title-up'>цвет объекта</p></div><div className='board-color board-color_up'>
                <HexColorPicker color={color} onChange={(color) => handleSetColor(color)} />
            </div></div>}
            {showTextColorPicker && <div><div className='board-color-title-bckg-down'><p className='board-color-title-down'>цвет текста</p></div><div className='board-color board-color_down'>
                <HexColorPicker color={textColor} onChange={(color) => handleSetTextColor(color)} />
            </div></div>}
            {showTextarea && <textarea
                defaultValue={textValue}
                onChange={handleChangeText}
                onBlur={handleFinishChangeText}
                autoFocus
                style={styleTextChange}
                ></textarea>}
            <canvas className='board-panel' ref={canvasRef} />
        </>
    )
}

export default BoardPage