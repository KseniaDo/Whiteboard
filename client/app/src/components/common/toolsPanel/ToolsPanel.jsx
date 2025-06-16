import { useState, useEffect } from 'react'
import './ToolsPanel.css'

function ToolsPanel({ onClick, selectedTool, showTextarea }) {
    const [ hideTools, setHideTools ] = useState(null);
    const [ activeToolId, setActiveToolId ] = useState(selectedTool);

    const Tools = [
        { toolId: 1, toolName: 'selectTool', elementClass: 'tool tools__select', keyValue: 's'},
        { toolId: 2, toolName: 'penTool', elementClass: 'tool tools__pen', keyValue: 'p'},
        { toolId: 3, toolName: 'arrowTool', elementClass: 'tool tools__arrow', keyValue: 'a'},
        { toolId: 4, toolName: 'rectTool', elementClass: 'tool tools__rect', keyValue: 'r'},
        { toolId: 5, toolName: 'ellipseTool', elementClass: 'tool tools__ellipse', keyValue: 'e'},
        { toolId: 6, toolName: 'textTool', elementClass: 'tool tools__text', keyValue: 't'},
        { toolId: 7, toolName: 'deleteTool', elementClass: 'tool tools__delete', keyValue: 'delete'},
    ];

    const toggleHide = () => {
        setHideTools(preventAnimLoad);
    };

    const preventAnimLoad = () => {
        if (hideTools === null) {
            return true;
        }
        if (hideTools) {
            return false;
        } else {
            return true;
        }
    }

    const handleClick = (event) => {
        const toolId = event.target.id;
        setActiveToolId(event.target.id);
        onClick(toolId);
    }

    useEffect(() => {
        setActiveToolId(selectedTool);
    }, [selectedTool]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const pressedKey = event.key.toLowerCase();
            const toolElement = Tools.find(element => element.keyValue == pressedKey);
            if (toolElement && !showTextarea) {
                setActiveToolId(toolElement.toolName);
                onClick(toolElement.toolName);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showTextarea]);

    return (
        <>
            <div className='tools-container'>
                <div className='toggle-tools' onClick={toggleHide}></div>
                <div className={hideTools === null ? 'tools' : (hideTools ? 'tools tools-hidden' : 'tools tools-show')}>
                    {Tools.map(({ toolId, toolName, elementClass, keyValue }) => (
                        <div key={toolId} onClick={handleClick} id={toolName} className={elementClass} style={{
                            backgroundColor: activeToolId === toolName ? 'rgba(56, 136, 255, 0.2)' : 'white'
                        }}></div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ToolsPanel