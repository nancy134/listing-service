const { expect } = require('chai')
const { match, stub, resetHistory } = require('sinon')
const proxyquire = require('proxyquire')

const { makeMockModels } = require('sequelize-test-helpers')

describe('tenants', () => {
    const Tenant = { findOne: stub(), findAndCountAll: stub() }
    const mockModels = makeMockModels({ Tenant })

    const tenant = proxyquire('../../tenant', {
        './models': mockModels
    })

    const id = 1;
    const data = {
        "id":1,
        "tenant":"Home Depot",
        "space":3000,
        "baseRent":null,
        "leaseEnds":"2020-12-31T00:00:00.000Z",
        "createdAt":"2020-05-25T20:43:58.851Z",
        "updatedAt":"2020-05-25T20:43:58.851Z",
        "ListingVersionId":1,
        "PreviousVersionId":null
    };
    const index = [{"id": 1, "tenant": "Home Depot"}];
    const fakeTenant = {id, ...data}
    context('tenant exists', () => {
        Tenant.findOne.resolves(fakeTenant)
        tenant.find().then((tenant) => {
            it('tenant found', () => {
                expect(1).to.equal(tenant.id)
            })
        })
    })
    context('tenant does not exist', () => {
        Tenant.findOne.resolves(undefined)
        tenant.find().then((tenant) => {
            it('tenant not found', () => {
                expect(undefined).to.equal(tenant)
            })
         })
    })
})
