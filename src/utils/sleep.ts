//rendering delay

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

// @Resolver()
// export class PostResolver {
//     @Query(() => [Post])
//     async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
//         await sleep(3000);
//         return em.find(Post, {});
//     }
