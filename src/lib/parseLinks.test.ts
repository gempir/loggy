import { describe, expect, it } from 'vitest'
import { parseTextWithLinks } from './parseLinks'

describe('parseTextWithLinks', () => {
  it('should return a single text segment when there are no URLs', () => {
    const result = parseTextWithLinks('This is just plain text')
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      type: 'text',
      content: 'This is just plain text',
    })
  })

  it('should detect URLs with https protocol', () => {
    const result = parseTextWithLinks('Check out https://example.com for more info')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ type: 'text', content: 'Check out ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'https://example.com',
      href: 'https://example.com',
    })
    expect(result[2]).toEqual({ type: 'text', content: ' for more info' })
  })

  it('should detect URLs with http protocol', () => {
    const result = parseTextWithLinks('Visit http://test.org now')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ type: 'text', content: 'Visit ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'http://test.org',
      href: 'http://test.org',
    })
    expect(result[2]).toEqual({ type: 'text', content: ' now' })
  })

  it('should detect URLs without protocol and add https://', () => {
    const result = parseTextWithLinks('Go to example.com please')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ type: 'text', content: 'Go to ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'example.com',
      href: 'https://example.com',
    })
    expect(result[2]).toEqual({ type: 'text', content: ' please' })
  })

  it('should detect URLs with www prefix', () => {
    const result = parseTextWithLinks('Try www.example.com today')
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ type: 'text', content: 'Try ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'www.example.com',
      href: 'https://www.example.com',
    })
    expect(result[2]).toEqual({ type: 'text', content: ' today' })
  })

  it('should detect multiple URLs in text', () => {
    const result = parseTextWithLinks('Visit https://example.com and www.test.org')
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ type: 'text', content: 'Visit ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'https://example.com',
      href: 'https://example.com',
    })
    expect(result[2]).toEqual({ type: 'text', content: ' and ' })
    expect(result[3]).toEqual({
      type: 'link',
      content: 'www.test.org',
      href: 'https://www.test.org',
    })
  })

  it('should handle URLs with paths and query parameters', () => {
    const result = parseTextWithLinks('Check https://example.com/path?foo=bar&baz=qux')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'text', content: 'Check ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'https://example.com/path?foo=bar&baz=qux',
      href: 'https://example.com/path?foo=bar&baz=qux',
    })
  })

  it('should handle URLs at the start of text', () => {
    const result = parseTextWithLinks('https://example.com is great')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      type: 'link',
      content: 'https://example.com',
      href: 'https://example.com',
    })
    expect(result[1]).toEqual({ type: 'text', content: ' is great' })
  })

  it('should handle URLs at the end of text', () => {
    const result = parseTextWithLinks('Go to https://example.com')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'text', content: 'Go to ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'https://example.com',
      href: 'https://example.com',
    })
  })

  it('should handle URLs with fragment identifiers', () => {
    const result = parseTextWithLinks('Read https://example.com/docs#section-1')
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ type: 'text', content: 'Read ' })
    expect(result[1]).toEqual({
      type: 'link',
      content: 'https://example.com/docs#section-1',
      href: 'https://example.com/docs#section-1',
    })
  })
})
