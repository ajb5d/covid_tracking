#!/usr/bin/env node
'use strict';

import * as path from 'path';
import fetch from 'node-fetch';
import { stat, readFile, writeFile } from 'fs/promises'
import * as d3 from 'd3';
import url from 'url';

const fips_map = {
    '51001': {
        locality: 'Accomack',
        health_district: 'Eastern Shore',
        population: 0.32316
    },
    '51003': {
        locality: 'Albemarle',
        health_district: 'Blue Ridge',
        population: 1.0933
    },
    '51005': {
        locality: 'Alleghany',
        health_district: 'Alleghany',
        population: 0.1486
    },
    '51007': {
        locality: 'Amelia',
        health_district: 'Piedmont',
        population: 0.13145
    },
    '51009': {
        locality: 'Amherst',
        health_district: 'Central Virginia',
        population: 0.31605
    },
    '51011': {
        locality: 'Appomattox',
        health_district: 'Central Virginia',
        population: 0.15911
    },
    '51013': {
        locality: 'Arlington',
        health_district: 'Arlington',
        population: 2.36842
    },
    '51015': {
        locality: 'Augusta',
        health_district: 'Central Shenandoah',
        population: 0.75558
    },
    '51017': {
        locality: 'Bath',
        health_district: 'Central Shenandoah',
        population: 0.04147
    },
    '51019': {
        locality: 'Bedford',
        health_district: 'Central Virginia',
        population: 0.78997
    },
    '51021': {
        locality: 'Bland',
        health_district: 'Mount Rogers',
        population: 0.0628
    },
    '51023': {
        locality: 'Botetourt',
        health_district: 'Alleghany',
        population: 0.33419
    },
    '51025': {
        locality: 'Brunswick',
        health_district: 'Southside',
        population: 0.16231
    },
    '51027': {
        locality: 'Buchanan',
        health_district: 'Cumberland Plateau',
        population: 0.21004
    },
    '51029': {
        locality: 'Buckingham',
        health_district: 'Piedmont',
        population: 0.17148
    },
    '51031': {
        locality: 'Campbell',
        health_district: 'Central Virginia',
        population: 0.54885
    },
    '51033': {
        locality: 'Caroline',
        health_district: 'Rappahannock',
        population: 0.30725
    },
    '51035': {
        locality: 'Carroll',
        health_district: 'Mount Rogers',
        population: 0.29791
    },
    '51036': {
        locality: 'Charles City',
        health_district: 'Chickahominy',
        population: 0.06963
    },
    '51037': {
        locality: 'Charlotte',
        health_district: 'Piedmont',
        population: 0.1188
    },
    '51041': {
        locality: 'Chesterfield',
        health_district: 'Chesterfield',
        population: 3.52802
    },
    '51043': {
        locality: 'Clarke',
        health_district: 'Lord Fairfax',
        population: 0.14619
    },
    '51045': {
        locality: 'Craig',
        health_district: 'Alleghany',
        population: 0.05131
    },
    '51047': {
        locality: 'Culpeper',
        health_district: 'Rappahannock Rapidan',
        population: 0.52605
    },
    '51049': {
        locality: 'Cumberland',
        health_district: 'Piedmont',
        population: 0.09932
    },
    '51051': {
        locality: 'Dickenson',
        health_district: 'Cumberland Plateau',
        population: 0.14318
    },
    '51053': {
        locality: 'Dinwiddie',
        health_district: 'Crater',
        population: 0.28544
    },
    '51057': {
        locality: 'Essex',
        health_district: 'Three Rivers',
        population: 0.10953
    },
    '51059': {
        locality: 'Fairfax',
        health_district: 'Fairfax',
        population: 11.47532
    },
    '51061': {
        locality: 'Fauquier',
        health_district: 'Rappahannock Rapidan',
        population: 0.71222
    },
    '51063': {
        locality: 'Floyd',
        health_district: 'New River',
        population: 0.15749
    },
    '51065': {
        locality: 'Fluvanna',
        health_district: 'Blue Ridge',
        population: 0.2727
    },
    '51067': {
        locality: 'Franklin County',
        health_district: 'West Piedmont',
        population: 0.56042
    },
    '51069': {
        locality: 'Frederick',
        health_district: 'Lord Fairfax',
        population: 0.89313
    },
    '51071': {
        locality: 'Giles',
        health_district: 'New River',
        population: 0.1672
    },
    '51073': {
        locality: 'Gloucester',
        health_district: 'Three Rivers',
        population: 0.37348
    },
    '51075': {
        locality: 'Goochland',
        health_district: 'Chickahominy',
        population: 0.23753
    },
    '51077': {
        locality: 'Grayson',
        health_district: 'Mount Rogers',
        population: 0.1555
    },
    '51079': {
        locality: 'Greene',
        health_district: 'Blue Ridge',
        population: 0.19819
    },
    '51081': {
        locality: 'Greensville',
        health_district: 'Crater',
        population: 0.11336
    },
    '51083': {
        locality: 'Halifax',
        health_district: 'Southside',
        population: 0.33911
    },
    '51085': {
        locality: 'Hanover',
        health_district: 'Chickahominy',
        population: 1.07766
    },
    '51087': {
        locality: 'Henrico',
        health_district: 'Henrico',
        population: 3.30818
    },
    '51089': {
        locality: 'Henry',
        health_district: 'West Piedmont',
        population: 0.50557
    },
    '51091': {
        locality: 'Highland',
        health_district: 'Central Shenandoah',
        population: 0.0219
    },
    '51093': {
        locality: 'Isle of Wight',
        health_district: 'Western Tidewater',
        population: 0.37109
    },
    '51095': {
        locality: 'James City',
        health_district: 'Peninsula',
        population: 0.76523
    },
    '51097': {
        locality: 'King and Queen',
        health_district: 'Three Rivers',
        population: 0.07025
    },
    '51099': {
        locality: 'King George',
        health_district: 'Rappahannock',
        population: 0.26836
    },
    '51101': {
        locality: 'King William',
        health_district: 'Three Rivers',
        population: 0.17148
    },
    '51103': {
        locality: 'Lancaster',
        health_district: 'Three Rivers',
        population: 0.10603
    },
    '51105': { locality: 'Lee', health_district: 'Lenowisco', population: 0.23423 },
    '51107': {
        locality: 'Loudoun',
        health_district: 'Loudoun',
        population: 4.13538
    },
    '51109': {
        locality: 'Louisa',
        health_district: 'Blue Ridge',
        population: 0.37591
    },
    '51111': {
        locality: 'Lunenburg',
        health_district: 'Piedmont',
        population: 0.12196
    },
    '51113': {
        locality: 'Madison',
        health_district: 'Rappahannock Rapidan',
        population: 0.13261
    },
    '51115': {
        locality: 'Mathews',
        health_district: 'Three Rivers',
        population: 0.08834
    },
    '51117': {
        locality: 'Mecklenburg',
        health_district: 'Southside',
        population: 0.30587
    },
    '51119': {
        locality: 'Middlesex',
        health_district: 'Three Rivers',
        population: 0.10582
    },
    '51121': {
        locality: 'Montgomery',
        health_district: 'New River',
        population: 0.98535
    },
    '51125': {
        locality: 'Nelson',
        health_district: 'Blue Ridge',
        population: 0.1493
    },
    '51127': {
        locality: 'New Kent',
        health_district: 'Chickahominy',
        population: 0.23091
    },
    '51131': {
        locality: 'Northampton',
        health_district: 'Eastern Shore',
        population: 0.1171
    },
    '51133': {
        locality: 'Northumberland',
        health_district: 'Three Rivers',
        population: 0.12095
    },
    '51135': {
        locality: 'Nottoway',
        health_district: 'Piedmont',
        population: 0.15232
    },
    '51137': {
        locality: 'Orange',
        health_district: 'Rappahannock Rapidan',
        population: 0.37051
    },
    '51139': {
        locality: 'Page',
        health_district: 'Lord Fairfax',
        population: 0.23902
    },
    '51141': {
        locality: 'Patrick',
        health_district: 'West Piedmont',
        population: 0.17608
    },
    '51143': {
        locality: 'Pittsylvania',
        health_district: 'Pittsylvania-Danville',
        population: 0.60354
    },
    '51145': {
        locality: 'Powhatan',
        health_district: 'Chesterfield',
        population: 0.29652
    },
    '51147': {
        locality: 'Prince Edward',
        health_district: 'Piedmont',
        population: 0.22802
    },
    '51149': {
        locality: 'Prince George',
        health_district: 'Crater',
        population: 0.38353
    },
    '51153': {
        locality: 'Prince William',
        health_district: 'Prince William',
        population: 4.70335
    },
    '51155': {
        locality: 'Pulaski',
        health_district: 'New River',
        population: 0.34027
    },
    '51157': {
        locality: 'Rappahannock',
        health_district: 'Rappahannock Rapidan',
        population: 0.0737
    },
    '51159': {
        locality: 'Richmond County',
        health_district: 'Three Rivers',
        population: 0.09023
    },
    '51161': {
        locality: 'Roanoke County',
        health_district: 'Alleghany',
        population: 0.94186
    },
    '51163': {
        locality: 'Rockbridge',
        health_district: 'Central Shenandoah',
        population: 0.22573
    },
    '51165': {
        locality: 'Rockingham',
        health_district: 'Central Shenandoah',
        population: 0.81948
    },
    '51167': {
        locality: 'Russell',
        health_district: 'Cumberland Plateau',
        population: 0.26586
    },
    '51169': {
        locality: 'Scott',
        health_district: 'Lenowisco',
        population: 0.21566
    },
    '51171': {
        locality: 'Shenandoah',
        health_district: 'Lord Fairfax',
        population: 0.43616
    },
    '51173': {
        locality: 'Smyth',
        health_district: 'Mount Rogers',
        population: 0.30104
    },
    '51175': {
        locality: 'Southampton',
        health_district: 'Western Tidewater',
        population: 0.17631
    },
    '51177': {
        locality: 'Spotsylvania',
        health_district: 'Rappahannock',
        population: 1.36215
    },
    '51179': {
        locality: 'Stafford',
        health_district: 'Rappahannock',
        population: 1.52882
    },
    '51181': { locality: 'Surry', health_district: 'Crater', population: 0.06422 },
    '51183': { locality: 'Sussex', health_district: 'Crater', population: 0.11159 },
    '51185': {
        locality: 'Tazewell',
        health_district: 'Cumberland Plateau',
        population: 0.40595
    },
    '51187': {
        locality: 'Warren',
        health_district: 'Lord Fairfax',
        population: 0.40164
    },
    '51191': {
        locality: 'Washington',
        health_district: 'Mount Rogers',
        population: 0.5374
    },
    '51193': {
        locality: 'Westmoreland',
        health_district: 'Three Rivers',
        population: 0.18015
    },
    '51195': {
        locality: 'Wise',
        health_district: 'Lenowisco',
        population: 0.37383
    },
    '51197': {
        locality: 'Wythe',
        health_district: 'Mount Rogers',
        population: 0.28684
    },
    '51199': { locality: 'York', health_district: 'Peninsula', population: 0.6828 },
    '51510': {
        locality: 'Alexandria',
        health_district: 'Alexandria',
        population: 1.59428
    },
    '51520': {
        locality: 'Bristol',
        health_district: 'Mount Rogers',
        population: 0.16762
    },
    '51530': {
        locality: 'Buena Vista City',
        health_district: 'Central Shenandoah',
        population: 0.06478
    },
    '51540': {
        locality: 'Charlottesville',
        health_district: 'Blue Ridge',
        population: 0.47266
    },
    '51550': {
        locality: 'Chesapeake',
        health_district: 'Chesapeake',
        population: 2.44835
    },
    '51570': {
        locality: 'Colonial Heights',
        health_district: 'Chesterfield',
        population: 0.1737
    },
    '51580': {
        locality: 'Covington',
        health_district: 'Alleghany',
        population: 0.05538
    },
    '51590': {
        locality: 'Danville',
        health_district: 'Pittsylvania-Danville',
        population: 0.40044
    },
    '51595': {
        locality: 'Emporia',
        health_district: 'Crater',
        population: 0.05346
    },
    '51600': {
        locality: 'Fairfax City',
        health_district: 'Fairfax',
        population: 0.24019
    },
    '51610': {
        locality: 'Falls Church',
        health_district: 'Fairfax',
        population: 0.14617
    },
    '51620': {
        locality: 'Franklin City',
        health_district: 'Western Tidewater',
        population: 0.07967
    },
    '51630': {
        locality: 'Fredericksburg',
        health_district: 'Rappahannock',
        population: 0.29036
    },
    '51640': {
        locality: 'Galax',
        health_district: 'Mount Rogers',
        population: 0.06347
    },
    '51650': {
        locality: 'Hampton',
        health_district: 'Hampton',
        population: 1.3451
    },
    '51660': {
        locality: 'Harrisonburg',
        health_district: 'Central Shenandoah',
        population: 0.53016
    },
    '51670': {
        locality: 'Hopewell',
        health_district: 'Crater',
        population: 0.22529
    },
    '51678': {
        locality: 'Lexington',
        health_district: 'Central Shenandoah',
        population: 0.07446
    },
    '51680': {
        locality: 'Lynchburg',
        health_district: 'Central Virginia',
        population: 0.82168
    },
    '51683': {
        locality: 'Manassas City',
        health_district: 'Prince William',
        population: 0.41085
    },
    '51685': {
        locality: 'Manassas Park',
        health_district: 'Prince William',
        population: 0.17478
    },
    '51690': {
        locality: 'Martinsville',
        health_district: 'West Piedmont',
        population: 0.12554
    },
    '51700': {
        locality: 'Newport News',
        health_district: 'Peninsula',
        population: 1.79225
    },
    '51710': {
        locality: 'Norfolk',
        health_district: 'Norfolk',
        population: 2.42742
    },
    '51720': {
        locality: 'Norton',
        health_district: 'Lenowisco',
        population: 0.03981
    },
    '51730': {
        locality: 'Petersburg',
        health_district: 'Crater',
        population: 0.31346
    },
    '51735': {
        locality: 'Poquoson',
        health_district: 'Peninsula',
        population: 0.12271
    },
    '51740': {
        locality: 'Portsmouth',
        health_district: 'Portsmouth',
        population: 0.94398
    },
    '51750': {
        locality: 'Radford',
        health_district: 'New River',
        population: 0.18249
    },
    '51760': {
        locality: 'Richmond City',
        health_district: 'Richmond',
        population: 2.30436
    },
    '51770': {
        locality: 'Roanoke City',
        health_district: 'Roanoke',
        population: 0.99143
    },
    '51775': {
        locality: 'Salem',
        health_district: 'Alleghany',
        population: 0.25301
    },
    '51790': {
        locality: 'Staunton',
        health_district: 'Central Shenandoah',
        population: 0.24932
    },
    '51800': {
        locality: 'Suffolk',
        health_district: 'Western Tidewater',
        population: 0.92108
    },
    '51810': {
        locality: 'Virginia Beach',
        health_district: 'Virginia Beach',
        population: 4.49974
    },
    '51820': {
        locality: 'Waynesboro',
        health_district: 'Central Shenandoah',
        population: 0.2263
    },
    '51830': {
        locality: 'Williamsburg',
        health_district: 'Peninsula',
        population: 0.14954
    },
    '51840': {
        locality: 'Winchester',
        health_district: 'Lord Fairfax',
        population: 0.28078
    }
};

const health_district_populations = new Map([["Eastern Shore", 0.44026], ["Blue Ridge", 2.56206], ["Alleghany", 1.78435], ["Piedmont", 1.02335], ["Central Virginia", 2.6356599999999997], ["Arlington", 2.36842], ["Central Shenandoah", 3.0091800000000006], ["Mount Rogers", 1.87258], ["Southside", 0.80729], ["Cumberland Plateau", 1.0250299999999999], ["Rappahannock", 3.75694], ["Chickahominy", 1.6157299999999999], ["Chesterfield", 3.9982400000000005], ["Lord Fairfax", 2.39692], ["Rappahannock Rapidan", 1.81509], ["Crater", 1.55035], ["Three Rivers", 1.41626], ["Fairfax", 11.86168], ["New River", 1.8328], ["West Piedmont", 1.36761], ["Henrico", 3.30818], ["Western Tidewater", 1.5481500000000001], ["Peninsula", 3.51253], ["Lenowisco", 0.86353], ["Loudoun", 4.13538], ["Pittsylvania-Danville", 1.0039799999999999], ["Prince William", 5.2889800000000005], ["Alexandria", 1.59428], ["Chesapeake", 2.44835], ["Hampton", 1.3451], ["Norfolk", 2.42742], ["Portsmouth", 0.94398], ["Richmond", 2.30436], ["Roanoke", 0.99143], ["Virginia Beach", 4.49974]])

async function getFileUpdateTime(path) {
    return stat(path)
        .then((result) => result.mtime)
        .catch(() => new Date(0));
}

async function getRemoteUpdate(URL) {
    return fetch(URL, { method: "Get"})
        .then(response => response.json())
        .then(metadata => new Date(metadata.dataUpdatedAt));
}

async function callIfTargetStale(target, sourceMetadata, callback) {
    Promise.all([target, sourceMetadata]).then((values) => {
        console.log(values)
        if (values[0] < values[1]) {
            console.log("Should Update")
            callback();
        } else {
            console.log("Won't update")
        }
    });
}

function pathForTarget(file) {
    return path.join(".", file)
}

const thresholdDate = d3.utcDay.offset(new Date(), -97);
const dateFormat = d3.timeFormat("%Y-%m-%d")
const caseDataURL = new url.URL('https://data.virginia.gov/resource/bre9-aqqr.json');
caseDataURL.searchParams.set('$where', `report_date > '${dateFormat(thresholdDate)}'`)
caseDataURL.searchParams.set('$select', 'report_date,fips,total_cases')
caseDataURL.searchParams.set('$limit', '49999')


function summariseHealthDepartmentData(data) {
    const prettyFormat = d3.format(".1f");

    const groupedData = d3.flatRollup(data,
        records => d3.sum(records.map(r => r.total_cases)),
        d => fips_map[d.fips].health_district,
        d => d.report_date);

    const newData = d3.flatRollup(groupedData, records => {
        const runningTotals = records.map(d => d[2]).reverse();
        const population = health_district_populations.get(records[0][0]);
        return {
            health_district: records[0][0],
            dates: records.map(d => d[1]).reverse(),
            totalCases: runningTotals,
            newCases: d3.pairs(runningTotals).map(([x,y]) => (x - y) / population).map(d => +prettyFormat(d)),
            weeklyNewCaseAvg: d3.range(0, runningTotals.length - 8).map(idx => (runningTotals[idx] - runningTotals[idx + 7]) / (7 * population)).map(d => +prettyFormat(d))
        }
    }, d => d[0]);

    return newData.map(d => d[1]);
};

callIfTargetStale(
    getFileUpdateTime(pathForTarget("rates_by_hd.json")),
    getRemoteUpdate("https://data.virginia.gov/api/views/metadata/v1/bre9-aqqr"),
    () => {
        fetch(caseDataURL.href, { method: "Get"})
            .then(d => d.json())
            .then(d => d.map(r => {
                r.report_date = new Date(r.report_date);
                r.total_cases = +r.total_cases;
                return r;
            }))
            .then(summariseHealthDepartmentData)
            .then(d => {
                writeFile('rates_by_hd.json', JSON.stringify(d));
            });
});

// readFile('data.json')
//     .then(d => JSON.parse(d).map(r => {
//         r.report_date = new Date(r.report_date);
//         r.total_cases = +r.total_cases;
//         return r;
//     }))
//     .then(summariseHealthDepartmentData)
//     .then(d => {
//         writeFile('rates_by_hd.json', JSON.stringify(d));
//     });