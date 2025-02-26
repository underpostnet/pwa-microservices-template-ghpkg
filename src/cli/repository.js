import { commitData } from '../client/components/core/CommonJs.js';
import dotenv from 'dotenv';
import { pbcopy, shellExec } from '../server/process.js';
import { actionInitLog, loggerFactory } from '../server/logger.js';
import fs from 'fs-extra';
import { getNpmRootPath } from '../server/conf.js';

dotenv.config();

const logger = loggerFactory(import.meta);

class UnderpostRepository {
  static API = {
    clone(gitUri = 'underpostnet/pwa-microservices-template') {
      const repoName = gitUri.split('/').pop();
      if (fs.existsSync(`./${repoName}`)) fs.removeSync(`./${repoName}`);
      return shellExec(
        `git clone https://${process.env.GITHUB_TOKEN ? `${process.env.GITHUB_TOKEN}@` : ''}github.com/${gitUri}.git`,
        {
          disableLog: true,
        },
      );
      if (process.env.GITHUB_TOKEN) {
        shellExec(
          `git clone https://${
            process.env.GITHUB_TOKEN ? `${process.env.GITHUB_TOKEN}@` : ''
          }github.com/${gitUri}-private.git`,
        );
        fs.moveSync(`./${repoName}-private`, `./${repoName}/engine-private`, {
          overwrite: true,
        });
      }
    },
    pull(repoPath = './', gitUri = 'underpostnet/pwa-microservices-template') {
      shellExec(
        `cd ${repoPath} && git pull https://${
          process.env.GITHUB_TOKEN ? `${process.env.GITHUB_TOKEN}@` : ''
        }github.com/${gitUri}.git`,
        {
          disableLog: true,
        },
      );
    },
    commit(
      repoPath = './',
      commitType = 'feat',
      subModule = '',
      message = '',
      options = {
        copy: false,
        info: false,
        empty: false,
      },
    ) {
      if (options.info) return logger.info('', commitData);
      const _message = `${commitType}${subModule ? `(${subModule})` : ''}${process.argv.includes('!') ? '!' : ''}: ${
        commitData[commitType].emoji
      } ${message ? message : commitData[commitType].description}`;
      if (options.copy) return pbcopy(_message);
      shellExec(`cd ${repoPath} && git commit ${options?.empty ? `--allow-empty ` : ''}-m "${_message}"`);
    },

    push(repoPath = './', gitUri = 'underpostnet/pwa-microservices-template', options = { force: false }) {
      shellExec(
        `cd ${repoPath} && git push https://${process.env.GITHUB_TOKEN}@github.com/${gitUri}.git${
          options?.f === true ? ' --force' : ''
        }`,
        {
          disableLog: true,
        },
      );
      logger.info(
        'commit url',
        `http://github.com/${gitUri}/commit/${shellExec(`cd ${repoPath} && git rev-parse --verify HEAD`, {
          stdout: true,
        }).trim()}`,
      );
    },

    new(repositoryName) {
      return new Promise(async (resolve, reject) => {
        try {
          const exeRootPath = `${getNpmRootPath()}/underpost`;
          // const exeRootPath = '/home/dd/pwa-microservices-template';
          actionInitLog();
          await logger.setUpInfo();
          const destFolder = `${process.cwd()}/${repositoryName}`;
          logger.info('Note: This process may take several minutes to complete');
          logger.info('build app', { destFolder });
          fs.mkdirSync(destFolder, { recursive: true });
          fs.copySync(exeRootPath, destFolder);
          if (fs.existsSync(`${destFolder}/node_modules`)) fs.removeSync(`${destFolder}/node_modules`);
          fs.writeFileSync(`${destFolder}/.gitignore`, fs.readFileSync(`${exeRootPath}/.dockerignore`, 'utf8'), 'utf8');
          shellExec(`cd ${destFolder} && git init && git add . && git commit -m "Base template implementation"`);
          shellExec(`cd ${destFolder} && npm install`);
          shellExec(`cd ${destFolder} && npm run build`);
          shellExec(`cd ${destFolder} && npm run dev`);
          return resolve();
        } catch (error) {
          logger.error(error, error.stack);
          return reject(error.message);
        }
      });
    },
  };
}

export default UnderpostRepository;
