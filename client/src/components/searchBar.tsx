import { useState, useEffect } from 'react';
import {Location, useLocation} from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import useDebounce from '../hooks/hooks';
import { IMessage } from '../interfaces';
import { apiService } from '../api';

interface IProps {
    message: IMessage;
    location: Location;
}

const MessageHistory = ({message, location}: IProps) => {
    async function findMessage(messagesId: string) {
        window.location.href = `/chat/${location.pathname.slice(6, 30)}#${messagesId}`; // think about window.location.href
    }

    return (
        <div key={message._id} 
            className="searched_message_container" 
            onClick={() => findMessage(message._id)}>

            <p className="searched_message">
                <span>{message.owner.username}:</span><br/>{message.content}
            </p>
        </div>
    )
}

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
        console.log("out")
        if (!searchBoxFocus) {
            await delay(200);
            setData([]); 
            setShowSearchBox(false);
        }
        setSearchBoxFocus(false);
    }

    useEffect(() => {
        getFilteredMessages();
    }, [debouncedSearchTerm]);

    return (
        <div className="search_bar">
            <div className="search_inputs">
                <input type="text" placeholder="Enter Message..." value={query} 
                    onBlur={outOfFocus} 
                    onFocus={() => {setShowSearchBox(true); getFilteredMessages()}} 
                    onChange={(e) => {setQuery(e.target.value)}}
                />
                {query.length < 1
                    ? <div className="search_icon" onClick={getFilteredMessages}><SearchIcon className="icon_search"/></div>
                    : <div className="delete_icon" onClick={() => {setQuery("")}}><DeleteIcon className="icon_delete"/></div>
                }
            </div>

            {showSearchBox && 
            <div className="filtered_result">
                {data.length > 0
                ?   <>
                        {data.map((message) => 
                            <MessageHistory message={message} location={location} key={message._id}/> 
                        )}
                    </>
                : <center><p className="searched_message">No results</p></center>
                }
            </div> 
            }
        </div>
    )
}

export default SearchBar;