
import fetch, {
    Response
} from 'node-fetch';
import * as fs from 'fs'
//import * as fast_xml_parser from 'fast-xml-parser';

/*
import * as fs from 'fs'
import * as assert from 'assert';
*/
const exchanges = {
    "Xetra": 44,
    "Hamburg": 17,
    "Frankfurt": 13,
    "Fonds": 10,
    "NYSE": 65,
    "SIX": 4,
    "NASDAQ": 67
}

type Currency = "EUR" | "AUD" | "USD" | "CHF";

const instrumentData: { isin: string, exchange: keyof typeof exchanges, currency: Currency }[] = [
    { isin: "DE0007236101", exchange: "Xetra", currency: "EUR" },
    { isin: "DE000LED4000", exchange: "Hamburg", currency: "EUR" },
    { isin: "LU0112806418", exchange: "Frankfurt", currency: "EUR" },
    { isin: "LU0112800569", exchange: "Frankfurt", currency: "EUR" },
    { isin: "LU0141249184", exchange: "Fonds", currency: "AUD" },
    { isin: "LU0644935313", exchange: "Fonds", currency: "EUR" },
    { isin: "CH0048265513", exchange: "NYSE", currency: "USD" },
    { isin: "CH0012032048", exchange: "SIX", currency: "CHF" },
    { isin: "CH0012005267", exchange: "SIX", currency: "CHF" },
    { isin: "CH0012255151", exchange: "SIX", currency: "CHF" },
    { isin: "CH0011075394", exchange: "SIX", currency: "CHF" },
    { isin: "CH0102484968", exchange: "SIX", currency: "CHF" },
    { isin: "CH0030170408", exchange: "SIX", currency: "CHF" },
    { isin: "CH0008742519", exchange: "SIX", currency: "CHF" },
    { isin: "CH0014852781", exchange: "SIX", currency: "CHF" },
    { isin: "CH0012138605", exchange: "SIX", currency: "CHF" },
    { isin: "CH0210483332", exchange: "SIX", currency: "CHF" },
    { isin: "CH0010645932", exchange: "SIX", currency: "CHF" },
    { isin: "CH0244767585", exchange: "SIX", currency: "CHF" },
    { isin: "CH0012214059", exchange: "SIX", currency: "CHF" },
    { isin: "CH0023405456", exchange: "SIX", currency: "CHF" },
    { isin: "US35952H6018", exchange: "NASDAQ", currency: "USD" },
    { isin: "CH0043238366", exchange: "SIX", currency: "CHF" },
];
/*
const parser = new fast_xml_parser.XMLParser({
    ignoreAttributes: false,
});
*/
(async () => {
    const stream = fs.createWriteStream("quotes.csv");
    await new Promise<void>((resolve) => stream.once('open', resolve))

    function writeRow(data: (string | number)[]): void {
        let index = 0;

        function write(value: string): void {
            stream.write(value)
        }

        const length = data.length
        for (; ;) {
            const value = data[index]
            if (value === "DE000ETF70114") {
                debugger
            }
            if (typeof (value) === "string") {
                function quotationMark(): void {
                    write('"')
                }
                quotationMark()
                write(value)
                quotationMark()
            }
            else {
                write(`${value}`)
            }
            index++;
            if (index === length) {
                break;
            }
            write(";")
        }
        write("\n")
    }
    writeRow(["ISIN", "Name", "Price", "Currency"])

    for (const instrument of instrumentData) {

        const isin = instrument.isin
        const exchange = instrument.exchange;
        console.log(`https://www.swissquote.ch/sq_mi/public/market/FullQuoteData.action?s=${isin}_${exchanges[exchange]}_${instrument.currency}`)
        const response: Response = await fetch(`https://www.swissquote.ch/sq_mi/public/market/FullQuoteData.action?s=${isin}_${exchanges[exchange]}_${instrument.currency}`)
        const json = await response.json()
        const cells = json.data.cells;
        const last = exchange === "Fonds" ? cells.LAST_AVAILABLE_PRICE : cells.LAST;
        writeRow([isin, cells.STOCK.attributes.NAME, last.content.replace(/'/g, ""), last.attributes.CURRENCY])

    };
    stream.end();
    console.log("done")
})();

/*
(async () => {


    const stream = fs.createWriteStream("prices.csv");
    await new Promise<void>((resolve) => stream.once('open', resolve))


    function writeRow(data: (string | number)[]): void {
        let index = 0;

        function write(value: string): void {
            stream.write(value)
        }

        const length = data.length
        for (; ;) {
            const value = data[index]
            if (value === "DE000ETF70114") {
                debugger
            }
            if (typeof (value) === "string") {
                function quotationMark(): void {
                    write('"')
                }
                quotationMark()
                write(value)
                quotationMark()
            }
            else {
                write(`${value}`)
            }
            index++;
            if (index === length) {
                break;
            }
            write(";")
        }
        write("\n")
    }

    writeRow(["ISIN", "Name" ])


    async function delay(ms: number) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

    const processed = new Set<string>()
    type Counter = {
        shares: number,
        funds: number,
        etfs: number,
        //bonds: number
    }
    function emptyCounter(): Counter {
        return {
            shares: 0,
            funds: 0,
            etfs: 0,
            //bonds: 0
        }
    }
    const found = emptyCounter()
    const pc = emptyCounter();

    async function loadPages<T, D>(uri: (page: number) => string,

        promise: (response: Response) => Promise<T>,
        toArray: (body: T) => D[],
        rowData: (row: D) => RowData,
        counter: "shares" | "funds" | "etfs"): Promise<void> {
        let page = 1;
        function log(kind: string, counter: Counter): void {
            console.log(`${kind} ${counter.shares} shares, ${counter.funds} funds, ${counter.etfs} etfs`);
        }
        for (; ;) {

            const response: Response = await fetch(`https://www.swissquote.ch/sqi_web_search/${uri(page)}`);
            const data = toArray(await promise(response));
            if (data.length === 0) {
                break
            }
            data.forEach((row: any) => {
                const rd = rowData(row)
                const visin = rd.isin;
                if (!processed.has(visin)) {
                    processed.add(visin)
                    writeRow([visin, rd.name()])
                    found[counter]++;
                }
                pc[counter]++;
            })
            log("processed", pc)
            delay(600)
            page++
        }
        log("processed", pc)
        log("found", found)
    }

    type RowData = {
        isin: string;
        name: () => string
    }



    await loadPages(page => `search/share/data/${(page - 1) * 1024}/1024?sort=name&dir=asc&columns=isin&columns=name&columns=exchangeId&columns=currency&colunms=marketName`,
        response => response.json(),
        body => body as any[],
        rowData => {
            return {
                isin: rowData.isin,
                name: () => rowData.name
            }
        },
        "shares")


    const parser = new fast_xml_parser.XMLParser({
        ignoreAttributes: false,
    });

    async function scrabHtml(type: "funds" | "etfs", search: string, selectAnchor: (achors: any) => any) {
        await loadPages(page => `market/equity/${type}/${search}Search.action?search=search&sort=name&page=${page}&dir=asc`,
            response => response.text(),
            xml => {
                const tr = parser.parse(xml).div.div.div.table.tbody.tr;
                if (Array.isArray(tr)) {
                    return tr;
                } else {
                    assert(tr["@_class"] === "empty")
                    return []
                }
            },
            row => {
                const data = row.td;
                return {
                    isin: selectAnchor(data[0].a)["@_data-attribute"].split("_")[0],
                    name: () => data[1].a["#text"]
                }
            },
            type
        )
    }
    await scrabHtml("funds", "Fund", a => a)
    await scrabHtml("etfs", "Etf", a => a[0])
    //scrabHtml("bonds", "Bond", a => a[0])
    stream.end();
})()

*/
