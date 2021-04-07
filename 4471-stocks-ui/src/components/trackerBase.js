import { useEffect, useState } from 'react';
import { TextField, MenuItem, Button, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import '../App.css';


const TrackerBase = (props) => {
    const { loading, tickers, tickerValue, setTickerValue, tickerCompareValue, setTickerCompareValue, startDate, endDate, setStartDate, setEndDate, openComparer, getStockInfo } = { ...props }

    const dates = [
        "2011/01/13",
        "2011/01/24",
        "2011/02/03",
        "2011/02/15",
        "2011/03/10",
        "2011/03/16",
        "2011/04/13",
        "2011/04/26",
        "2011/05/03",
        "2011/05/18",
        "2011/06/02",
        "2011/06/16",
        "2011/07/06",
        "2011/07/21",
        "2011/08/18",
        "2011/08/29",
        "2011/09/19",
        "2011/09/30",
        "2011/10/20",
        "2011/10/31",
        "2011/11/21",
        "2011/11/25",
        "2011/11/29",
        "2011/12/06",
        "2011/12/07",
    ]

    const isSearchDisabled = () => {
        if (startDate == '' && endDate == '') return true
        if (startDate != '' && endDate == '') return false
        if (startDate == '' && endDate != '') return false

        let start = new Date(startDate)
        let end = new Date(endDate)

        if (start <= end) return false
        return true
    }

    return (
        <div className="TrackerContainer">
            <Autocomplete
                className="TextField"
                fullWidth
                options={tickers}
                value={tickerValue}
                onChange={(event, newValue) => {
                    setTickerValue(newValue)
                }}
                color="primary"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select a ticker"
                        variant="outlined"
                        inputProps={{
                            ...params.inputProps,
                        }}
                    />
                )}
            />
            {openComparer
                ? <Autocomplete
                    className="TextField"
                    fullWidth
                    options={tickers}
                    value={tickerCompareValue}
                    onChange={(event, newValue) => {
                        setTickerCompareValue(newValue)
                    }}
                    color="primary"
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select a ticker for comparison"
                            variant="outlined"
                            inputProps={{
                                ...params.inputProps,
                            }}
                        />
                    )}
                />
                : null
            }
            <TextField
                className="TextField"
                fullWidth
                style={{marginBottom: '2vh'}}
                select
                label="Select a start date"
                variant="outlined"
                color="primary"
                onChange={(evt) => {
                    setStartDate(evt.target.value)
                }}
            >
                {
                    dates.map(date => (
                        <MenuItem key={date} value={date}>{date}</MenuItem>
                    ))
                }
            </TextField>
            <TextField
                className="TextField"
                fullWidth
                style={{marginBottom: '2vh'}}
                select
                label="Select an end date"
                variant="outlined"
                color="primary"
                onChange={(evt) => setEndDate(evt.target.value)}

            >
                {
                    dates.map(date => (
                        <MenuItem key={date} value={date}>{date}</MenuItem>
                    ))
                }
            </TextField>
            <Button
                fullWidth
                style={{width: '100%'}}
                onClick={() => getStockInfo(tickerValue, startDate, endDate)}
                variant="contained"
                color="primary"
                disabled={isSearchDisabled()}>
                {loading ? <CircularProgress style={{ color: 'white' }}/> : <p>See Stock Performance</p>}
            </Button>
            
        </div>
    )
}

export default TrackerBase