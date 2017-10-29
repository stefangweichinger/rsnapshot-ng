const _async = require('async-magic');
const _fs = require('fs-magic');
const _path = require('path');
const _assert = require('assert');
const _childProcess = require('child_process');
const _exec = _async.promisify(_childProcess.execFile, 'exec');
const _rsnapshotBin = _path.join(__dirname, '../rsnapshot');
const _rsnapshotConfig = _path.join('/tmp', 'rsnapshot.conf');

// rsnapshot execution wrapper
// run perl interpreter with binary present in root dir and given args
async function rsnapshot(...args){

    // run rsnapshot
    const [stdout, stderr] = await _exec('perl', [_rsnapshotBin, ...args]);

    return [stdout, stderr];
}

// run rsnapshot with dynamic generated config
async function rsnapshotDynamicConfig(config, ...args){
    let b = '';

    config.forEach(function(line){
        b += line + "\n";
    });

    // write file
    await _fs.writeFile(_rsnapshotConfig, b, 'utf8');

    // run rsnapshot with tmp config
    return await rsnapshot('-c', _rsnapshotConfig, ...args);
}

// compare directoy contents based on external diff utility
async function compareDirectories(dir1, dir2){

    try{
        // run diff - returncode 0 on success
        const [stdout, stderr] = await _exec('diff', ['-rq', dir1, dir2]);

        return true;
    }catch(e){
        return false;
    }
}

// expose functions
module.exports = {
    rsnapshot: rsnapshot,
    rsnapshotDynamicConfig: rsnapshotDynamicConfig,
    compareDirectories: compareDirectories,

    // bin paths
    bin: {
        cp:     '/bin/cp',
        rm:     '/bin/rm',
        rsync:  '/usr/bin/rsync',
        ssh:    '/usr/bin/ssh',
        logger: '/usr/bin/logger',
        du:     '/usr/bin/du'
    },

    // conf
    path: {
        snapshotRoot: '/tmp/snapshots',
        data: '/tmp/data'
    }
};