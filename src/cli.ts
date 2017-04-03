
import fs from 'fs'

export class Kronk {

  registerExtension(ext: string) {

  }

}

export const kronk = new Kronk()

/// 1. Look for the package.json

/// 2. Extract basic informations to create the Project

/// 3. Load plugins from this information (mostly file handlers)

/// 3. Watch or run once, which ever comes first
