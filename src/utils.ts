import { Alignment, AlignmentType, HeadingLevel } from 'docx'
import { Tokens } from 'marked'

import { IBlockAttr, MarkdownImageType } from './types'

export function getHeadingLevel(level?: number) {
  if (level == null) {
    return undefined
  }
  switch (level) {
    case 0:
      return HeadingLevel.TITLE
    case 1:
      return HeadingLevel.HEADING_1
    case 2:
      return HeadingLevel.HEADING_2
    case 3:
      return HeadingLevel.HEADING_3
    case 4:
      return HeadingLevel.HEADING_4
    case 5:
      return HeadingLevel.HEADING_5
    case 6:
      return HeadingLevel.HEADING_6
    default:
      // if (import.meta.env.MODE === 'development') {
      //   console.warn('Heading level out of range, defaulting to Heading 6')
      // }
      return HeadingLevel.HEADING_6
  }
}


export function getTextAlignment(align: IBlockAttr['align']) {
  switch (align) {
    case 'left':
      return AlignmentType.LEFT
    case 'center':
      return AlignmentType.CENTER
    case 'right':
      return AlignmentType.RIGHT
    default:
      return undefined
  }
}

export function getImageTokens(tokenList: any[], tokens: Tokens.Image[] = []) {
  for (const token of tokenList) {
    if (!token) continue
    if (token.type === 'image') {
      tokens.push(token)
    } else if (token.tokens?.length) {
      getImageTokens(token.tokens, tokens)
    }
  }
  return tokens
}


// A map to normalize mime types to file extensions.
const mimeTypeToExtension: Record<string, MarkdownImageType> = {
  jpeg: 'jpg',
  png: 'png',
  gif: 'gif',
  bmp: 'bmp',
  webp: 'webp',
  'svg+xml': 'svg',
}

// Whitelist of supported image types.
const ImageTypeWhitelist = new Set(Object.values(mimeTypeToExtension) )



/**
 * Gets the image extension from the filename or mime type.
 * @param filename - The filename of the image.
 * @param mime - The mime type of the image.
 * @returns The image extension.
 * @throws An error if the image extension cannot be determined or is not supported.
 */
export function getImageExtension(filename: string = '', mime?: string | null): MarkdownImageType {
  let ext: string | undefined

  if (mime) {
    // Normalize mime type, e.g., "image/jpeg" -> "jpeg", or "jpeg" -> "jpeg"
    const type = mime.includes('/') ? mime.split('/')[1] : mime
    if (type) {
      ext = mimeTypeToExtension[type]
    }else{
      // If the mime type is not in the map, try to get the extension from the
      ext = "png"
    }
  }

  // If extension is not found from mime type, try to get it from the filename.
  if (!ext && filename) {
    const name = filename.split('?').pop() || ''
    const index = name.lastIndexOf('.')
    if (index > -1) {
      ext = name.substring(index + 1).toLowerCase()
    }
  }

  if (!ext) {
    throw new Error(`Cannot get image extension from filename "${filename}" or mime type "${mime}"`)
  }

  if (!ImageTypeWhitelist.has(ext as MarkdownImageType)) {
    throw new Error(`Image extension "${ext}" is not supported`)
  }

  return ext as MarkdownImageType
}


export function isHttp (src: string) {
  return /^https?:\/\//.test(src)
}
