import apiMock from './apiMock.js'
import apiClientReal from './apiClientReal.js'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'
const blueprintsService = useMock ? apiMock : apiClientReal

export default blueprintsService