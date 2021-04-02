import { useEffect, useState } from 'react';
import { TextField, MenuItem, Button, CircularProgress } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import DatePicker from '@material-ui/lab/DatePicker';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import '../App.css';


const TrackerBase = (props) => {
    const { tickers, tickerValue, setTickerValue, tickerCompareValue, setTickerCompareValue, openComparer, getStockInfo } = { ...props }


    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

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
            <Button onClick={() => getStockInfo(startDate, endDate)} variant="contained" color="primary" disabled={isSearchDisabled()}>See Stock Performance</Button>
            
        </div>
    )
}

export default TrackerBase


{/*tickerValue != null
                ? <>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>

                        <DatePicker
                            value={stockDate}
                            minDate={new Date('2011-01-14')}
                            maxDate={new Date('2012-01-13')}
                            className="TextField"
                            defaultCalendarMonth={new Date('2011-01-13')}
                            onChange={(newValue) => {
                                console.log(newValue)
                                setStockDate(newValue);
                            }}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    <Button fullWidth variant="contained" color="primary" onClick={() => getStockInfo()}>See Stock</Button>
                </>
                : null
            */}