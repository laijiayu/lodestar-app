import { ChevronDownIcon } from '@chakra-ui/icons'
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import BraftEditor from 'braft-editor'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled, { css } from 'styled-components'
import { CommonLargeTitleMixin, CommonTitleMixin } from '../common'
import { BREAK_POINT } from '../common/Responsive'
import StarRating from '../common/StarRating'
import { BraftContent } from '../common/StyledBraftEditor'
import PracticeUploadModal from './PracticeUploadModal'

const messages = defineMessages({
  practice: { id: 'program.label.practice', defaultMessage: '作業練習' },
  estimateTime: { id: 'program.text.estimateTime', defaultMessage: '預估實作 {duration} 分鐘' },
  difficulty: { id: 'program.term.difficulty', defaultMessage: '難易度' },
  downloadMaterial: { id: 'program.ui.downloadMaterial', defaultMessage: '下載素材' },
})

const StyledBlock = styled.div`
  padding: 1.5rem;
  background-color: white;
`
const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
`
const StyledTitle = styled.h2`
  ${CommonTitleMixin}
  line-height: 1;
`
const StyledPracticeTitle = styled.h3`
  ${CommonLargeTitleMixin}
  line-height: 1;
`
const StyledEvaluation = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: ${BREAK_POINT}px) {
    flex-direction: row;
  }
`
const StyledPractice = styled.div`
  padding: 0 clamp(12px, 2vw, 32px);
`
const StyledEvaluationText = css`
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  height: 22px;
  letter-spacing: 0.18px;
  color: var(--gray-darker);
`
const StyledEstimateTime = styled.div`
  ${StyledEvaluationText}
  margin-right: 12px;
  margin-bottom: 8px;

  @media (min-width: ${BREAK_POINT}px) {
    margin-bottom: 0;
    border-right: 1px solid var(--gray);
    padding-right: 12px;
  }
`
const StyledDifficulty = styled.div`
  ${StyledEvaluationText}
`

const PracticeDescriptionBlock: React.FC<{
  title: string
  description: string | null
  duration?: number
  score?: number
}> = ({ title, description, duration, score }) => {
  const { formatMessage } = useIntl()

  const handleDownload = () => {}

  return (
    <StyledBlock>
      <StyledInfo className="mb-3">
        <StyledTitle className="mb-2">{formatMessage(messages.practice)}</StyledTitle>
        <StyledEvaluation>
          <StyledEstimateTime>{formatMessage(messages.estimateTime, { duration: duration || 0 })}</StyledEstimateTime>
          <StyledDifficulty className="d-flex align-items-center">
            <div className="mr-2">{formatMessage(messages.difficulty)}</div>
            <StarRating score={score || 0} max={5} size="20px" />
          </StyledDifficulty>
        </StyledEvaluation>
      </StyledInfo>

      <StyledPractice className="mb-4">
        <StyledPracticeTitle className="mb-3">{title}</StyledPracticeTitle>
        {!BraftEditor.createEditorState(description).isEmpty() && <BraftContent>{description}</BraftContent>}
        <Menu>
          <MenuButton as={Button} variant="outline" rightIcon={<ChevronDownIcon />} className="mt-3">
            {formatMessage(messages.downloadMaterial)}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleDownload()}>Download1</MenuItem>
            <MenuItem onClick={() => handleDownload()}>Download2</MenuItem>
          </MenuList>
        </Menu>
      </StyledPractice>
      <PracticeUploadModal />
    </StyledBlock>
  )
}

export default PracticeDescriptionBlock