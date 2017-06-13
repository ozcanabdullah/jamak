import PropTypes from 'prop-types';
import React from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { ipcRenderer } from 'electron';
import path from 'path';
import validator from 'validator';

import { subtitleTypes, videoTypes } from '../../../common/fileTypes';

import Button from '../Button';
import PrepareState from '../PrepareState';

import styles from './styles.css';

const PrepareDropzone = ({
  videoFilename,
  subtitleFilename,
  videoReady,
  subtitleReady,
  onVideoOpen,
  onSubtitleOpen,
  onSubtitleNew,
}) => {
  ipcRenderer.on('open-video', () => {
    onVideoOpen();
  });

  ipcRenderer.on('open-file', () => {
    onSubtitleOpen();
  });

  ipcRenderer.on('new-file', () => {
    onSubtitleNew();
  });

  const handleDrop = (files) => {
    files.forEach((file) => {
      const filePath = file.path;
      const ext = path.extname(filePath).substring(1);

      if (validator.isIn(ext, subtitleTypes)) {
        ipcRenderer.send('ask-open-file', filePath);
      } else if (validator.isIn(ext, videoTypes)) {
        ipcRenderer.send('ask-open-video', filePath);
      }
    });
  };

  const loadVideoButtonClick = (event) => {
    event.preventDefault();
    ipcRenderer.send('ask-open-video-dialog');
  };

  const loadFileButtonClick = (event) => {
    event.preventDefault();
    ipcRenderer.send('ask-open-file-dialog');
  };

  const newFileButtonClick = (event) => {
    event.preventDefault();
  };

  const startButtonClick = (event) => {
    event.preventDefault();
  };

  return (
    <Dropzone
      disableClick
      className={styles.dropzone}
      activeClassName={styles.active}
      onDrop={handleDrop}
    >
      <div>
        <div className={styles.text}>자막 편집을 시작하려면<br />파일을 드래그 앤 드랍하세요</div>
        <svg className={classNames(styles.icon, styles.big)} viewBox="0 0 72 72">
          <path d="M27,48h18V30h12L36,9L15,30h12V48z M15,54h42v6H15V54z" />
        </svg>
        <div className={styles.text}>또는</div>
        <div>
          <Button onClick={loadVideoButtonClick}>비디오 불러오기</Button>
          <Button onClick={loadFileButtonClick}>자막 불러오기</Button>
          <Button onClick={newFileButtonClick}>새 자막 만들기</Button>
        </div>
        <div className={styles.stateContainer}>
          <PrepareState ready={videoReady} filename={videoFilename}>비디오</PrepareState>
          <PrepareState ready={subtitleReady} filename={subtitleFilename}>자막</PrepareState>
        </div>
        <div>
          <Link replace to={videoReady && subtitleReady ? '/editor' : ''}>
            <Button big disabled={!(videoReady && subtitleReady)}>
              {videoReady && subtitleReady ? '편집 시작하기' : '파일을 먼저 불러오세요'}
            </Button>
          </Link>
        </div>
      </div>
    </Dropzone>
  );
};

PrepareDropzone.propTypes = {
  subtitleFilename: PropTypes.string,
  videoFilename: PropTypes.string,
  videoReady: PropTypes.bool.isRequired,
  subtitleReady: PropTypes.bool.isRequired,
  onVideoOpen: PropTypes.func.isRequired,
  onSubtitleOpen: PropTypes.func.isRequired,
  onSubtitleNew: PropTypes.func.isRequired,
};

export default PrepareDropzone;
