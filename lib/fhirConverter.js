'use strict'
const moment = require('moment-interval')

exports.convert = (input) => {
	const fhir = fhirSkeleton()
	const interval = moment.interval(input.adx.group.period);

	fhir.period = {
		start: interval.start().toISOString(),
		end: interval.end().toISOString()
	}
	fhir.reportingOrganization = {
		reference: `Organization/${input.adx.group.orgUnit}`
	}
	fhir.group = groupItems(input.adx.group.dataValue)

	return fhir
}

const groupItems = (items) => {
	return items.reduce((groups, item) => {
		const group = groups.find(e => e.identifier.value == item.dataElement) || addGroup(groups, item)
		const strat = group.stratifier.find(e => e.identifier.value == stratifierLabel(item)) || addStratifier(group.stratifier, item)
		strat.stratum.push(createStratum(item))
		return groups
	}, [])
}

const addStratifier = (stratifiers, item) => {
	stratifiers.push(createStratifier(item))
	return stratifiers.slice(-1)[0]
}

const addGroup = (groups, item) => {
	groups.push(createGroup(item))
	return groups.slice(-1)[0]
}

const createGroup = (entry) => {
	return {
		identifier: {
			value: entry.dataElement
		},
		stratifier: [createStratifier(entry)]
	}
}

const createStratifier = (entry) => {
	return {
		identifier: {
			value: stratifierLabel(entry)
		},
		stratum: []
	}
}

const createStratum = (entry) => {
	return {
		value: getProps(entry).map(k => entry[k]).join(':'),
		measureScore: parseFloat(entry.value)
	}
}

const stratifierLabel = (entry) => {
	return getProps(entry).join(':')
}

const getProps = (entry) => {
	return Object.keys(entry).filter(k => k !== 'dataElement' && k !== 'value')
}

const fhirSkeleton = () => {
	return {
		resourceType: 'MeasureReport',
		status: 'complete',
		type: 'summary',
		measure: {
			reference: 'http://ohie.org/Measure/hiv-indicators'
		},
		group: []
	}
}
