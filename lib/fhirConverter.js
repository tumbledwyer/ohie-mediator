'use strict'

exports.convert = (input) => {
    const fhir = fhirSkeleton()
    //todo period conversion
    fhir.group = doGrouping(input.adx.group.dataValue)
    return fhir
}

const doGrouping = (items) => {
    return items.reduce((groups, item) => {
        const existing = groups.find(e => e.identifier.value == item.dataElement)
        if (existing) {
            const strat = existing.stratifier.find(e => e.identifier.value == stratLabel(item))
            if (strat) {
                strat.stratum.push(createStratum(item))
            } else {
                existing.stratifier.push(createStratifier(item))
            }
            return groups
        }

        groups.push(createGroup(item))

        return groups
    }, [])
}

const createGroup = (group) => {
    return {
        identifier: {
            value: group.dataElement
        },
        measureScore: 0,
        stratifier: [createStratifier(group)]
    }
}

function createStratifier(entry) {
    return {
        identifier: {
            value: stratLabel(entry)
        },
        stratum: [createStratum(entry)]
    }
}

function createStratum(entry) {
    const props = getProps(entry)
    const values = props.map(k => entry[k])
    return {
        value: values.join(':'),
        measureScore: entry.value
    }
}

function stratLabel(entry) {
    return getProps(entry).join(':')
}

function getProps(entry) {
    return Object.keys(entry).filter(k => k !== 'dataElement' && k !== 'value')
}

function fhirSkeleton() {
    return {
        resourceType: 'MesaureReport',
        status: 'complete',
        type: 'summary',
        measure: {
            reference: 'Measure/ADX_HIV'
        },
        group: []
    }
}