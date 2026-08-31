import { Router } from 'express'
import { home, getArchiveCatalog, getCurrentCatalog, schedules, genre, animeByGenre, search } from '../modules/library/library.controller.js'
import { getAnimeProfile, getDownloadBundle, epsAnime, epsMirror } from '../modules/media/media.controller.js'
import { embedProxy } from '../modules/media/embed.controller.js'

const router  = Router()

router.get('/home', home)
router.get('/embed', embedProxy)
router.get('/completed',getArchiveCatalog)
router.get('/completed/page/:page',getArchiveCatalog)
router.get('/ongoing',getCurrentCatalog)
router.get('/ongoing/page/:page',getCurrentCatalog)
router.get('/schedule',schedules)
router.get('/genres',genre)
router.get('/genre/:id/page/:pageNumber',animeByGenre)
router.get('/search/:query',search)
router.get('/anime/:id',getAnimeProfile)
router.get('/batch/:id',getDownloadBundle)
router.get('/episode/:id',epsAnime)
router.post('/episode/:animeId/mirror/',epsMirror)

export default router