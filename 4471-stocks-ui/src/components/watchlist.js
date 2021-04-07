import { useEffect, useState } from 'react';
import '../App.css';
import logo from '../logo192.png';
import { TextField, Button, Dialog, DialogContent, DialogTitle, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

const Watchlist = (props) => {
    const { navigateToStock, getWatchlist, tickers, watchlist, setWatchlist, openWatchlist, setOpenWatchlist, addToWatchlist, removeFromWatchlist } = { ...props }
    const [newStock, setNewStock] = useState(null)



    useEffect(() => {
        getWatchlist()
    }, [])

    useEffect(() => {
        console.log(watchlist)
    }, [watchlist])

    const watchlistDisabled = () => {
        if (watchlist.includes(newStock)) return true
        if (newStock == null) return true
        if (watchlist.length >= 5) return true
        return false
    }

    return (
        <Dialog
            open={openWatchlist}
            onClose={() => setOpenWatchlist(false)}
        >
            <DialogTitle>
                <h2 style={{ textAlign: 'center' }}>Watchlist</h2>
            </DialogTitle>
            <DialogContent>
                <div className="WatchlistContainer">
                    {watchlist == []
                        ? null
                        : watchlist.map(stock => (
                            <div className="AddStockContainer">
                                <Button fullWidth onClick={() => navigateToStock(stock) } variant="contained" color="primary">{stock}</Button>
                                <Button onClick={() => removeFromWatchlist(stock)} style={{margin: '0 0 0 1vw'}} variant="contained" color="secondary">-</Button>
                            </div>
                        ))
                    } 
                </div>
                <div className="AddStockContainer">
                    <Autocomplete
                        className="TextField"
                        fullWidth
                        disabled={watchlist.length >= 5}
                        options={tickers}
                        value={newStock}
                        onChange={(event, newValue) => {
                            setNewStock(newValue)
                        }}
                        color="primary"
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Add Stock"
                                variant="outlined"
                                inputProps={{
                                    ...params.inputProps,
                                }}
                            />
                        )}
                    />
                    {watchlist.length >= 5 ? <Button variant="text" disabled style={{ disabled: {color: 'black'}, margin: '0 0 2vh 1vw' }}>Limit Reached</Button> : <Button onClick={() => addToWatchlist(newStock)} disabled={watchlistDisabled()} style={{ margin: '0 0 2vh 1vw' }} variant="contained" color="primary">+</Button>}
                </div>
                </DialogContent>
        </Dialog>
    )
}

export default Watchlist;