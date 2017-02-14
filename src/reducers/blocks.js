import * as types from '../constants/actionTypes/blocks';

const initialState = {
  blocks: [],
  selectedBlockId: 0,
  currentBlockId: 0,
};

export default function blocks(state = initialState, action) {
  switch (action.type) {
    case types.SET_DATA:
      return {
        ...state,
        blocks: action.data,
      };
    case types.CURRENT_BLOCK: {
      const currentBlock = state.blocks.find((block) =>
        block.startTime <= action.currentTime && block.endTime >= action.currentTime,
      );
      return {
        ...state,
        currentBlockId: currentBlock ? currentBlock.id : 0,
      };
    }
    case types.SELECT_BLOCK:
      return {
        ...state,
        selectedBlockId: action.id,
      };
    case types.ADD_BLOCK: {
      const { currentTime, duration } = action;
      const newBlocks = state.blocks.slice();

      let id;
      let startTime = currentTime;
      let endTime = currentTime + 3;

      if (state.currentBlockId !== 0) {
        if (state.blocks.length === state.currentBlockId) {
          endTime = endTime > duration ? duration : endTime;
        } else {
          endTime = endTime > state.blocks[state.currentBlockId].startTime
          ? state.blocks[state.currentBlockId].startTime
          : endTime;
        }
        id = state.currentBlockId;
        newBlocks[id - 1].endTime = startTime;
        // 뭐 해야되나?
      } else {
        if (state.blocks.length === 0) {
          // 첫번째 블록
          id = 1;
          endTime = endTime > duration ? duration : endTime;
        } else if (state.blocks[0].startTime > currentTime) {
          // 블록 맨 처음에 삽입
          id = 0;
          endTime = endTime > state.blocks[0].startTime ? state.blocks[0].startTime : endTime;
        } else if (state.blocks[state.blocks.length - 1].endTime < currentTime) {
          // 블록 맨 끝에 삽입
          id = state.blocks.length;
          endTime = endTime > duration ? duration : endTime;
        } else {
          // 두 블록 사이에 삽입
          const nextBlock = state.blocks.find((block, index) =>
            block.startTime > currentTime && state.blocks[index - 1].endTime < currentTime,
          );
          id = nextBlock.id - 1;
          endTime = endTime > nextBlock.startTime ? nextBlock.startTime : endTime;
        }
      }

      newBlocks.splice(id, 0, {
        id,
        startTime,
        endTime,
        subtitle: '',
      });
      newBlocks.forEach((current, index) => {
        newBlocks[index].id = index + 1;
      });
      return {
        ...state,
        blocks: newBlocks,
      };
    }
    case types.CLEAR_BLOCK:
      return {
        ...state,
        blocks: state.blocks.map((block) => {
          if (block.id !== action.id) {
            return block;
          }

          return {
            ...block,
            subtitle: '',
          };
        }),
      };
    case types.DELETE_BLOCK:
      return {
        ...state,
        blocks: state.blocks.filter((block) => block.id !== action.id),
        selectedBlockId: 0,
      };
    case types.UPDATE_BLOCK_TEXT:
      return {
        ...state,
        blocks: state.blocks.map((block) => {
          if (block.id !== action.id) {
            return block;
          }

          return {
            ...block,
            subtitle: action.subtitle,
          };
        }),
      };
    case types.UPDATE_BLOCK_TIME:
      return {
        ...state,
        blocks: state.blocks.map((block) => {
          if (block.id !== action.id) {
            return block;
          }

          return {
            ...block,
            stateTime: action.startTime,
            endTime: action.endTime,
          };
        }),
      };

    // case types.RESET_BLOCK_ID:
    //   return update(state, {
    //     blocks: {
    //       $apply: (blocks) => {
    //         return blocks.map((block, index) => {
    //           var obj = block;
    //           obj.id = index + 1;
    //           return obj;
    //         });
    //       }
    //     }
    //   });
    // // Sort blocks by value of startTime
    // case types.SORT_BLOCKS:
    //   var sortedBlocks = state.blocks.slice().sort(function(a, b) {
    //     if(a.startTime > b.startTime) {
    //       return 1;
    //     } else if(a.startTime < b.startTime) {
    //       return -1;
    //     } else {
    //       return 0;
    //     }
    //   });

    //   return update(state, {
    //     blocks: {
    //       $set: sortedBlocks
    //     }
    //   });
    // // 첫번째 블록을 만들거나 맨 앞 부분에 새 블록을 추가
    // case types.ADD_BLOCK_FIRST:
    //   return update(state, {
    //     blocks: {
    //       $unshift: [{
    //         id: 1,
    //         subtitle: '',
    //         startTime: action.startTime,
    //         endTime: action.endTime
    //       }]
    //     },
    //     currentBlockId: { $set: 1 },
    //     selectedBlockId: { $set: 1 }
    //   });
    // // 맨 마지막에 새 블록 추가
    // case types.ADD_BLOCK_LAST:
    //   return update(state, {
    //     blocks: {
    //       $push: [{
    //         id: state.blocks.length + 1,
    //         subtitle: '',
    //         startTime: action.startTime,
    //         endTime: action.endTime
    //       }]
    //     },
    //     currentBlockId: { $set: state.blocks.length + 1 },
    //     selectedBlockId: { $set: state.blocks.length + 1 }
    //   });
    // // 어떤 블록 위에서 새 블록 추가
    // case types.ADD_BLOCK_OVER:
    //   return update(state, {
    //     blocks: {
    //       [state.currentBlockId - 1]: {
    //         endTime: { $set: action.startTime}
    //       },
    //       $splice: [[
    //         state.currentBlockId, 0, {
    //           id: state.currentBlockId + 1,
    //           subtitle: '',
    //           startTime: action.startTime,
    //           endTime: action.endTime
    //         }
    //       ]]
    //     },
    //     currentBlockId: { $set: state.currentBlockId + 1 },
    //     selectedBlockId: { $set: state.currentBlockId + 1 }
    //   });
    // // 블록을 두 블록 사이에 새 블록 추가
    // case types.ADD_BLOCK_BETWEEN:
    //   return update(state, {
    //     blocks: {
    //       $splice: [[
    //         action.nextBlockId - 1, 0, {
    //           id: action.nextBlockId,
    //           subtitle: '',
    //           startTime: action.startTime,
    //           endTime: action.endTime
    //         }
    //       ]]
    //     },
    //     currentBlockId: { $set: action.nextBlockId },
    //     selectedBlockId: { $set: action.nextBlockId }
    //   });
    // // 선택된 블록 삭제
    // // update를 이용해 리턴하는 것으로 만들기
    // case types.DELETE_BLOCK:
    //   return update(state, {
    //     blocks: {
    //       $splice: [[
    //         action.id - 1, 1
    //       ]]
    //     },
    //     selectedBlockId: { $set: null }
    //   });
    // // 선택된 블록 초기화
    // case types.CLEAR_BLOCK:
    //   return update(state, {
    //     blocks: {
    //       [action.id - 1]: {
    //         subtitle: { $set: '' }
    //       }
    //     }
    //   });
    // // 블록 하나 선택
    // case types.SELECT_BLOCK:
    //   return update(state, {
    //     selectedBlockId: { $set: action.id }
    //   });
    // // 현재 재생 위치에 있는 블록
    // case types.CURRENT_BLOCK:
    //   return update(state, {
    //     currentBlockId: { $set: action.id }
    //   });
    // // 선택된 블록 자막 수정
    // case types.UPDATE_BLOCK_TEXT:
    //   return update(state, {
    //     blocks: {
    //       [state.currentBlockId - 1]: {
    //         subtitle: { $set: action.subtitle }
    //       }
    //     }
    //   });
    // // 블록 시간 수정
    // case types.UPDATE_BLOCK_TIME:
    //   return update(state, {
    //     blocks: {
    //       [action.id - 1]: {
    //         startTime: { $set: action.startTime },
    //         endTime: { $set: action.endTime }
    //       }
    //     }
    //   });
    // // 자막 파일 초기화
    // case types.NEW_BLOCK_FILE:
    //   return update(state, {
    //     blocks: { $set : [] }
    //   });
    // // 자막 파일 블록으로 불러오기
    // case types.LOAD_BLOCK_FILE:
    //   return update(state, {
    //     blocks: { $set: action.blocks }
    //   });
    // // 한 번 이상 저장된 자막 파일로 설정
    // case types.SAVED_BLOCK_FILE:
    //   return update(state, {
    //     blockFilePath: { $set: action.path },
    //     blockFileSaved: { $set: true }
    //   });
    // // 저장되지 않은 자막 파일로 설정
    // case types.UNSAVED_BLOCK_FILE:
    //   return update(state, {
    //     blockFilePath: { $set: '' },
    //     blockFileSaved: { $set: false }
    //   });

    default:
      return state;
  }
}