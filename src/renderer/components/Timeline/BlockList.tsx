import React, { Component } from 'react';
import { remote } from 'electron';
import Block from '../Block/Block';
import Transformer from '../Block/Transformer';
import { Subtitle } from '../../models/subtitle';
import styled from '../../styles/styled-components';
import SizeContext from './SizeContext';
import { getTimeRange, dxToTime, timeToDx } from '../../utils/time';
import Draggable from '../Block/Draggable';

const { Menu } = remote;

const VirtualView = styled.div`
  top: 5%;
  height: 40%;
  position: relative;
  will-change: transform;
`;

interface Props {
  subtitles: Subtitle[];
  selectedIndex: Set<number>;
  duration: number;
  setSelection(selectedIndex: Set<number>): void;
  appendSelection(selectedIndex: Set<number>): void;
  popSelection(selectedIndex: Set<number>): void;
  updateSubtitle(param: { index: number; subtitle: Subtitle }): void;
  deleteSubtitle(indexes: Set<number>): void;
  seek(nextTime: number): void;
  endSeek(playbackOnSeekEnd: boolean): void;
}

class BlockList extends Component<Props> {
  static contextType = SizeContext;

  handleDragStart = () => {};

  handleDragMove = () => {};

  handleDragEnd = (index: number) => (x: number, y: number) => {
    const { subtitles, duration, updateSubtitle } = this.props;

    const { width, zoomMultiple } = this.context;

    const diffTime = dxToTime(x, width, zoomMultiple, duration);

    const startTime = subtitles[index].startTime + diffTime;
    const endTime = subtitles[index].endTime + diffTime;

    updateSubtitle({
      index,
      subtitle: {
        startTime,
        endTime,
        texts: subtitles[index].texts,
      },
    });
  };

  getBound = (index: number) => {
    const { subtitles, duration } = this.props;
    const { width, zoomMultiple } = this.context;

    const currentSubtitle = subtitles[index];
    const prevSubtitle = index > 0 ? subtitles[index - 1] : null;
    const nextSubtitle =
      index < subtitles.length - 1 ? subtitles[index + 1] : null;

    // get distance between prev and current and next and current

    console.log(index);
    const prevTime = prevSubtitle === null ? 0 : prevSubtitle.endTime;
    const nextTime = nextSubtitle === null ? duration : nextSubtitle.startTime;

    const dxPrev = timeToDx(
      currentSubtitle.startTime,
      prevTime,
      width,
      zoomMultiple,
      duration,
    );
    const dxNext = timeToDx(
      currentSubtitle.endTime,
      nextTime,
      width,
      zoomMultiple,
      duration,
    );

    return { min: { x: dxPrev, y: 0 }, max: { x: dxNext, y: 0 } };
  };

  handleSelect = (index: number, selected: boolean) => (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const { setSelection, appendSelection, popSelection } = this.props;

    const newSelction = new Set([index]);

    if (event.ctrlKey) {
      selected ? popSelection(newSelction) : appendSelection(newSelction);
    } else {
      selected ? appendSelection(newSelction) : setSelection(newSelction);
    }
  };

  handleContextMenu = (index: number) => (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const { deleteSubtitle } = this.props;

    const menu = Menu.buildFromTemplate([
      {
        label: 'Delete',
        click: () => {
          deleteSubtitle(new Set([index]));
        },
      },
    ]);

    menu.popup({ window: remote.getCurrentWindow() });
  };

  handleDoubleClick = (startTime: number) => (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const { seek, endSeek } = this.props;

    seek(startTime / 1000);
    endSeek(false);
  };

  renderVisibleBlocks = () => {
    const { subtitles, duration, selectedIndex } = this.props;

    const { scrollLeft, width, zoomMultiple } = this.context;

    const start = scrollLeft;
    const end = scrollLeft + width;
    const full = width * zoomMultiple;

    const { startTime, endTime } = getTimeRange(start, end, full, duration);

    const visibleBlocks: React.ReactNode[] = [];

    subtitles.forEach((subtitle, index) => {
      const visible =
        subtitle.startTime <= endTime && subtitle.endTime >= startTime;

      if (visible) {
        const selected = selectedIndex.has(index);

        const { min, max } = this.getBound(index);

        console.log(min, max);
        visibleBlocks.push(
          <Draggable
            key={subtitle.id}
            direction="horizontal"
            min={min}
            max={max}
            onDragStart={this.handleDragStart}
            onDragMove={this.handleDragMove}
            onDragEnd={this.handleDragEnd(index)}
          >
            <Block
              index={index}
              duration={duration}
              startTime={subtitle.startTime}
              endTime={subtitle.endTime}
              texts={subtitle.texts}
              selected={selected}
              onSelect={this.handleSelect(index, selected)}
              onContextMenu={this.handleContextMenu(index)}
              onDoubleClick={this.handleDoubleClick(subtitle.startTime)}
            />
          </Draggable>,
        );
      }
    });

    return visibleBlocks;
  };

  render() {
    return <VirtualView>{this.renderVisibleBlocks()}</VirtualView>;
  }
}

export default BlockList;
