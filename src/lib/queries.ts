import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { db } from './firebase'
// import { openai } from './openai'
import axios from 'axios'

import { CohereClient } from 'cohere-ai'

const cohere = new CohereClient({
  token: process.env.NEXT_PUBLIC_COHERCE_API_KEY,
})
export const getSummary = async ({
  conversationId,
  userId,
}: {
  conversationId: string
  userId: string
}) => {
  try {
    const conversationRef = doc(
      db,
      `conversations/${userId}/userConversations`,
      conversationId,
    )
    const conversationSnap = await getDoc(conversationRef)

    if (!conversationSnap.exists()) {
      return {
        error: 'Conversation not found',
        data: null,
      }
    }

    const data = conversationSnap.data()

    const completions = await cohere.summarize({
      text: JSON.stringify(data),
    })

    console.log({ completions })

    return { error: null, data: completions }
  } catch (error: any) {
    console.error('something went wrong', error)
    return {
      error: error?.message ?? 'Something went wrong',
      data: null,
    }
  }
}

export async function getTitleAndConversationId(userId: string) {
  const conversationsRef = collection(
    db,
    `conversations/${userId}/userConversations`,
  )
  const snapshot = await getDocs(conversationsRef)

  const conversations = snapshot.docs.map((doc) => {
    const data = doc.data()
    return JSON.stringify({
      title: data.title,
      conversation_id: data.conversation_id,
    })
  })

  return conversations
}

export async function tagData(data: string[]) {
  const cut = data.slice(0, 96)
  const completions = await cohere.classify({
    inputs: cut,
    examples: [
      {
        text: 'Discussions about technology, gadgets, programming, etc.',
        label: 'Tech',
      },
      {
        text: 'Software development, tech trends, and innovations.',
        label: 'Tech',
      },
      {
        text: 'Topics related to learning, studying, and academic subjects.',
        label: 'Education',
      },
      {
        text: 'Online courses, study tips, and educational resources.',
        label: 'Education',
      },
      {
        text: 'Conversations about physical or mental health, fitness, wellness.',
        label: 'Health',
      },
      {
        text: 'Nutrition, exercise routines, and mental health tips.',
        label: 'Health',
      },
      {
        text: 'Movies, music, books, games, and other forms of entertainment.',
        label: 'Entertainment',
      },
      {
        text: 'TV shows, music reviews, and gaming experiences.',
        label: 'Entertainment',
      },
      {
        text: 'Destinations, travel tips, experiences, and related discussions.',
        label: 'Travel',
      },
      {
        text: 'Travel itineraries, destination guides, and travel hacks.',
        label: 'Travel',
      },
      {
        text: 'Recipes, dining experiences, culinary preferences.',
        label: 'Food',
      },
      {
        text: 'Restaurant reviews, cooking techniques, and food trends.',
        label: 'Food',
      },
      {
        text: 'Professional development, job advice, career goals.',
        label: 'Career',
      },
      {
        text: 'Job applications, career planning, and professional skills.',
        label: 'Career',
      },
      {
        text: 'Personal relationships, social interactions, advice.',
        label: 'Relationships',
      },
      {
        text: 'Relationship advice, social dynamics, and communication skills.',
        label: 'Relationships',
      },
      { text: 'Budgeting, investing, economic discussions.', label: 'Finance' },
      {
        text: 'Financial planning, investment strategies, and market trends.',
        label: 'Finance',
      },
      {
        text: 'Daily routines, hobbies, personal interests.',
        label: 'Lifestyle',
      },
      {
        text: 'Home organization, hobbies, and lifestyle choices.',
        label: 'Lifestyle',
      },
      {
        text: 'Scientific topics, discoveries, experiments.',
        label: 'Science',
      },
      {
        text: 'Research findings, scientific theories, and new inventions.',
        label: 'Science',
      },
      {
        text: 'News, trends, and recent developments.',
        label: 'Current Events',
      },
      {
        text: 'Global events, political updates, and societal changes.',
        label: 'Current Events',
      },
      {
        text: 'Personal growth, productivity tips, motivation.',
        label: 'Self-Improvement',
      },
      {
        text: 'Self-help strategies, personal development, and motivational content.',
        label: 'Self-Improvement',
      },
      { text: 'Cultural events, practices, and traditions.', label: 'Culture' },
      {
        text: 'Cultural norms, historical practices, and traditions.',
        label: 'Culture',
      },
      {
        text: 'Discussions on sustainability, nature, and ecology.',
        label: 'Environment',
      },
      {
        text: 'Conservation efforts, environmental policies, and nature conservation.',
        label: 'Environment',
      },
      {
        text: 'Issues, troubleshooting, and software bugs.',
        label: 'Bug Fixes',
      },
      {
        text: 'Error resolution, debugging techniques, and software troubleshooting.',
        label: 'Bug Fixes',
      },
      {
        text: 'Time management, efficiency, and tools.',
        label: 'Productivity',
      },
      {
        text: 'Productivity hacks, time-saving tools, and work efficiency.',
        label: 'Productivity',
      },
      { text: 'Graphic design, UI/UX, aesthetics.', label: 'Design' },
      {
        text: 'Visual design, user experience improvements, and design principles.',
        label: 'Design',
      },
      { text: 'Strategies, campaigns, and promotions.', label: 'Marketing' },
      {
        text: 'Advertising tactics, market research, and promotional strategies.',
        label: 'Marketing',
      },
      {
        text: 'Programming languages, code snippets, development. Data Structures, Algorithms, and Design Patterns.',
        label: 'Coding',
      },
      {
        text: 'Cloud, Aws, Mobile App Development, and Mobile Development, Web App Development, Error handling, and troubleshooting.',
        label: 'Coding',
      },
      { text: 'Data analysis, experiments, findings.', label: 'Research' },
      {
        text: 'Scientific studies, data interpretation, and academic research.',
        label: 'Research',
      },
      { text: 'Reviews, comments, suggestions.', label: 'Feedback' },
      {
        text: 'Product reviews, user comments, and feedback collection.',
        label: 'Feedback',
      },
      { text: 'Forums, groups, and social interactions.', label: 'Community' },
      {
        text: 'Online communities, group discussions, and social platforms.',
        label: 'Community',
      },
      {
        text: 'Cybersecurity, data protection, and privacy.',
        label: 'Security',
      },
      {
        text: 'Information security, data breaches, and protection measures.',
        label: 'Security',
      },

      { text: 'Other.', label: 'Other' },
      { text: 'Other that dont fit in the above categories.', label: 'Other' },
    ],
  })
  return completions
}