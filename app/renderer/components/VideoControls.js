import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { togglePlay, toggleMute } from '../constants/actionTypes';
import classNames from 'classnames';


class VideoControls extends Component {
  handleTogglePlay(e) {
    e.preventDefault();
    this.props.onTogglePlay();
  }
  handleClickMute(e) {
    e.preventDefault();
    this.props.onToggleMute();
  }

  render() {
    let playButtonClass = classNames({
      'video-controls__button': true,
      'video-controls__button--pause': this.props.playing,
      'video-controls__button--play': !this.props.playing
    });

    let muteButtonClass = classNames({
      'video-controls__button': true,
      'video-controls__button--mute': this.props.muted,
      'video-controls__button--unmute': !this.props.muted
    });

    return (
      <div className="video-controls">
        <button
          className={playButtonClass}
          onClick={this.handleTogglePlay.bind(this)}
          disabled={this.props.url === null}></button>
        <button
          className={muteButtonClass}
          onClick={this.handleClickMute.bind(this)}
          disabled={this.props.url === null}></button>
        {/* <input
          className="video-controls__volume"
          type="range"
          min={0}
          max={1}
          step={0.01} /> */}
      </div>
    );
  }
}

VideoControls.propTypes = {
  onTogglePlay: PropTypes.func.isRequired,
  onToggleMute: PropTypes.func.isRequired,
  url: PropTypes.string,
  playing: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  return {
    url: state.player.url,
    playing: state.player.playing,
    volume: state.player.volume,
    muted: state.player.muted,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onTogglePlay: () => dispatch(togglePlay()),
    onToggleMute: () => dispatch(toggleMute()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoControls);