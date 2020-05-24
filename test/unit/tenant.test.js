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
        tenant: "Home Depot"
    }
    const index = [{"id": 1, "tenant": "Home Depot"}];
    const fakeTenant = {id, ...data}
    context('user exists', () => {
        Tenant.findOne.resolves(fakeTenant)
        Tenant.findAndCountAll.resolves(index);
        tenant.getTenants().then((results) => {
            it('get tenants', () => {
                expect(1).to.equal(results.tenants[0].id)
            })
        })
    })
})
