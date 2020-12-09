import { useQuery } from '@apollo/react-hooks'
import { Divider, Icon } from '@chakra-ui/react'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useRef } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../containers/common/AppContext'
import { reviewMessages } from '../../helpers/translation'
import { useReviewAggregate } from '../../hooks/review'
import { ReactComponent as StarEmptyIcon } from '../../images/star-empty.svg'
import { ReactComponent as StarLargeIcon } from '../../images/star-l.svg'
import types from '../../types'
import { MemberReviewProps } from '../../types/review'
import { useAuth } from '../auth/AuthContext'
import ReviewAdminItemCollection from './ReviewAdminItemCollection'
import ReviewMemberItemCollection, { ReviewMemberItemRef } from './ReviewMemberItemCollection'
import ReviewModal from './ReviewModal'
import ReviewPublicItemCollection from './ReviewPublicItemCollection'

const Wrapper = styled.div`
  div {
    .review-item:last-child {
      .chakra-divider.review-divider {
        display: none;
      }
    }
  }
`
export const StyledTitle = styled.h2`
  font-size: 24px;
  color: #585858;
  letter-spacing: 0.2px;
  font-weight: bold;
`
export const StyledAvgScore = styled.div`
  font-weight: bold;
  font-size: 40px;
  letter-spacing: 1px;
`
export const StyledReviewAmount = styled.div`
  color: #9b9b9b;
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledEmptyText = styled.div`
  color: #9b9b9b;
  font-size: 14px;
  letter-spacing: 0.4px;
`
const EmptyIconWrapper = styled.div`
  text-align: center;
`
export const StyledDivider = styled(Divider)`
  && {
    height: 1px;
    background: #ececec;
    border: none;
    opacity: 1;
    margin: 24px 0px 24px 0px;
  }
`
const ReviewCollectionBlock: React.FC<{
  title?: string
  targetId: string
  path: string
}> = ({ title, targetId, path }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const { settings, id: appId } = useApp()
  const { loadingReviewAggregate, averageScore, reviewCount, refetchReviewAggregate } = useReviewAggregate(path)
  const { loadingEnrolledMembers, enrolledMembers } = useEnrolledMembers(targetId)
  const { loadingProductEditorIds, productEditorIds } = useProductEditorIds(targetId)
  const { loadingCurrentMemberReview, currentMemberReview, refetchCurrentMemberReview } = useCurrentMemberReview(
    currentMemberId,
    path,
    appId,
  )

  const reviewMemberItemRef = useRef<ReviewMemberItemRef>(null)

  if (loadingEnrolledMembers || loadingProductEditorIds || loadingReviewAggregate || loadingCurrentMemberReview) {
    return (
      <>
        <StyledTitle>{title || formatMessage(reviewMessages.title.programReview)}</StyledTitle>
        <StyledDivider mt={1} />
        <Skeleton />
      </>
    )
  }

  return (
    <>
      <StyledTitle>{title || formatMessage(reviewMessages.title.programReview)}</StyledTitle>
      <StyledDivider mt={1} />

      <div className="d-flex align-items-center mt-3">
        <StyledAvgScore className="mr-1">{averageScore === 0 ? 0 : averageScore?.toFixed(1)}</StyledAvgScore>
        <div className="mr-2">
          <Icon as={StarLargeIcon} />
        </div>
        <StyledReviewAmount className="flex-grow-1">
          {formatMessage(reviewMessages.text.reviewAmount, { amount: reviewCount })}
        </StyledReviewAmount>
        {enrolledMembers.includes(currentMemberId) &&
          (currentUserRole !== 'app-owner' || (currentMemberId && productEditorIds?.includes(currentMemberId))) && (
            <ReviewModal
              path={path}
              memberReviews={currentMemberReview}
              onRefetchReviewMemberItem={reviewMemberItemRef.current?.onRefetchReviewMemberItem}
              onRefetchReviewAggregate={refetchReviewAggregate}
              onRefetchCurrentMemberReview={refetchCurrentMemberReview}
            />
          )}
      </div>

      {reviewCount && reviewCount >= (settings.review_lower_bound ? Number(settings.review_lower_bound) : 3) ? (
        <Wrapper>
          {currentUserRole === 'app-owner' || (currentMemberId && productEditorIds?.includes(currentMemberId)) ? (
            <ReviewAdminItemCollection targetId={targetId} path={path} appId={appId} />
          ) : currentUserRole === 'anonymous' ||
            (currentUserRole !== 'general-member' && !enrolledMembers.includes(currentMemberId)) ? (
            <ReviewPublicItemCollection targetId={targetId} path={path} appId={appId} />
          ) : (
            <ReviewMemberItemCollection ref={reviewMemberItemRef} targetId={targetId} path={path} appId={appId} />
          )}
        </Wrapper>
      ) : (
        <>
          <EmptyIconWrapper className="mt-4">
            <Icon as={StarEmptyIcon} w="100" h="100" />
            <StyledEmptyText className="mt-3">
              {formatMessage(reviewMessages.text.notEnoughReviews, {
                amount: Number(settings.review_lower_bound) || 3,
              })}
            </StyledEmptyText>
          </EmptyIconWrapper>
        </>
      )}
    </>
  )
}

const useEnrolledMembers = (targetId: string) => {
  const { loading, error, data } = useQuery<types.GET_ENROLLED_MEMBERS, types.GET_ENROLLED_MEMBERSVariables>(
    gql`
      query GET_ENROLLED_MEMBERS($targetId: uuid!) {
        program_enrollment(where: { program_id: { _eq: $targetId } }) {
          member_id
        }
      }
    `,
    { variables: { targetId } },
  )
  const enrolledMembers: (string | null)[] = data?.program_enrollment?.map(v => v.member_id) || []
  return {
    loadingEnrolledMembers: loading,
    errorEnrolledMembers: error,
    enrolledMembers,
  }
}
const useProductEditorIds = (targetId: string) => {
  const { loading, error, data } = useQuery<types.GET_PRODUCT_EDITOR_IDS, types.GET_PRODUCT_EDITOR_IDSVariables>(
    gql`
      query GET_PRODUCT_EDITOR_IDS($targetId: uuid!) {
        program(where: { id: { _eq: $targetId } }) {
          program_roles(where: { name: { _eq: "instructor" } }) {
            id
            member_id
            name
          }
        }
        podcast_program(where: { id: { _eq: $targetId } }) {
          podcast_program_roles(where: { name: { _eq: "instructor" } }) {
            id
            member_id
            name
          }
        }
      }
    `,
    {
      variables: { targetId },
    },
  )

  const productEditorIds: string[] =
    loading || error || !data
      ? []
      : [
          ...((data.program.length !== 0 && data?.program[0].program_roles.map(v => v.member_id)) || []),
          ...((data.podcast_program.length !== 0 &&
            data?.podcast_program[0].podcast_program_roles.map(v => v.member_id)) ||
            []),
        ]
  return {
    loadingProductEditorIds: loading,
    errorProductEditorIds: error,
    productEditorIds,
  }
}

const useCurrentMemberReview = (currentMemberId: string | null, path: string, appId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_CURRENT_MEMBER_REVIEW,
    types.GET_CURRENT_MEMBER_REVIEWVariables
  >(
    gql`
      query GET_CURRENT_MEMBER_REVIEW($currentMemberId: String, $path: String, $appId: String) {
        review(where: { member_id: { _eq: $currentMemberId }, path: { _eq: $path }, app_id: { _eq: $appId } }) {
          id
          member_id
          score
          title
          content
          private_content
        }
      }
    `,
    {
      variables: { currentMemberId, path, appId },
    },
  )
  const currentMemberReview: MemberReviewProps[] =
    data?.review?.map(v => ({
      id: v.id,
      memberId: v.member_id,
      score: v.score,
      title: v.title,
      content: v.content,
      privateContent: v.private_content,
    })) || []

  return {
    loadingCurrentMemberReview: loading,
    errorCurrentMemberReview: error,
    currentMemberReview,
    refetchCurrentMemberReview: refetch,
  }
}

export default ReviewCollectionBlock