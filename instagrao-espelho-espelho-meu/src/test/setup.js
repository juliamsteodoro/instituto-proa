import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

window.scrollTo = () => {} // jsdom não implementa rolagem

beforeEach(() => localStorage.clear())
afterEach(() => cleanup())
