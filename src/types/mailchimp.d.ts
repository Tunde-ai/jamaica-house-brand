declare module '@mailchimp/mailchimp_marketing' {
  interface Config {
    apiKey: string
    server: string
  }

  interface MergeFields {
    FNAME?: string
    PHONE?: string
    [key: string]: string | undefined
  }

  interface AddListMemberBody {
    email_address: string
    status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'transactional'
    merge_fields?: MergeFields
    tags?: string[]
  }

  interface ListMemberResponse {
    id: string
    email_address: string
    status: string
  }

  interface Lists {
    addListMember(
      listId: string,
      body: AddListMemberBody
    ): Promise<ListMemberResponse>
    setListMember(
      listId: string,
      subscriberHash: string,
      body: AddListMemberBody
    ): Promise<ListMemberResponse>
  }

  const mailchimp: {
    setConfig(config: Config): void
    lists: Lists
  }

  export default mailchimp
}
