const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect;
chai.use(sinonChai);

const {
    sequelize,
    dataTypes,
    checkModelName,
    checkPropertyExists
} = require('sequelize-test-helpers')

const TenantModel = require('../../../models/tenants')

describe('src/models/tenant', () => {

    const Tenant = TenantModel(sequelize, dataTypes)
    const tenant = new Tenant()

    checkModelName(Tenant)('Tenant')

    context('properties', () => {
        ;[
            'tenant', 
            'space', 
            'baseRent', 
            'leaseEnds', 
            'createdAt', 
            'updatedAt'
        ].forEach(checkPropertyExists(tenant))
    })

    context('associations', () => {
        const ListingVersion = 'ListingVersion'

        before(() => {
            Tenant.associate({ListingVersion})
        })

        it ('defined a belongsTo association with ListingVersion', () => {
            expect(Tenant.belongsTo).to.have.been.calledWith(ListingVersion)
        })
    })
})
