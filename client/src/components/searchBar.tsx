import { useState, useEffect } from 'react';
import useDebounce from '../hooks';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import {useLocation} from 'react-router-dom';
import { IMessage } from '../interfaces';
import { apiService } from '../api';

const SearchBar = () => {
    const [data, setData] = useState<Array<IMessage>>([]);
    const [query, setQuery] = useState<string>("");
    const [showSearchBox, setShowSearchBox] = useState<boolean>(false);
    const [searchBoxFocus, setSearchBoxFocus] = useState<boolean>(false);
    const debouncedSearchTerm = useDebounce<string>(query, 200);
    const location = useLocation();

    async function getFilteredMessages() {
        if (query.length < 1) return setData([]);
        try {
            const response = await apiService.getFilteredMessage(query, location.pathname.slice(6, 30));

            setData(response.data.messages);
        } catch(err) {
            console.log(err);
        }
    }

    function delay(time: number) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async function outOfFocus() {
        if (!searchBoxFocus) {
            await delay(200);
            setData([]); 
            setShowSearchBox(false);
        }

        setSearchBoxFocus(false)
    }

    async function findMessage(messagesId: string) {
        window.location.href = `/chat/${location.pathname.slice(6, 30)}#${messagesId}`;
    }

    useEffect(() => {
        getFilteredMessages();
    }, [debouncedSearchTerm]);

    return (
        <div className="search_bar">
            <div className="search_inputs">
                <input type="text" placeholder="Enter Message..." value={query} 
                    onBlur={outOfFocus} 
                    onFocus={(e) => { setShowSearchBox(true); getFilteredMessages() }} 
                    onChange={(e) => {setQuery(e.target.value)}}
                />
                {query.length < 1
                    ? <div className="search_icon" onClick={getFilteredMessages}><SearchIcon className="icon_search"/></div>
                    : <div className="delete_icon" onClick={(e) => {setQuery("")}}><DeleteIcon className="icon_delete"/></div>
                }
            </div>

            {showSearchBox && <div className="filtered_result" onClick={(e) => { e.stopPropagation() }}>
                {data.length > 0
                ?   <>
                        {data.map((message) => {
                            return <div key={message._id} 
                                        className="searched_message_container" 
                                        onClick={(e) => findMessage(message._id)}>

                                        <p className="searched_message">
                                            <span>{message.owner.username}:</span><br/>{message.content}
                                        </p>
                                    </div>
                        })}
                    </>
                : <center><p className="searched_message"> No results </p></center>
                }
            </div> }
        </div>
    )
}

export default SearchBar;