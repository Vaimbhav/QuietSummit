import type { RequestHandler } from 'express'
import type { IncomingMessage, ServerResponse } from 'http'

declare module 'compression' {
    interface CompressionOptions {
        threshold?: number | string
        filter?: (req: IncomingMessage, res: ServerResponse) => boolean
    }

    function compression(options?: CompressionOptions): RequestHandler

    export = compression
}
