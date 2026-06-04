import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
    const comment = req.body;

    if (!comment || !comment.commentText) {
        return res.json({ status: "Skipped - No comment text" });
    }

    const spamWords = ['crypto', 'bitcoin', 'scam', 'free money', 'click here', 'casino', 'viagra'];
    const textToCheck = comment.commentText.toLowerCase();

    const isSpam = spamWords.some(word => textToCheck.includes(word));

    if (isSpam) {
        log(`🚨 Spam detected! Deleting comment ID: ${comment.$id}`);
        
        const client = new Client()
            .setEndpoint('https://nyc.cloud.appwrite.io/v1')
            .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new Databases(client);

        try {
            await databases.deleteDocument(
                comment.$databaseId,
                comment.$collectionId,
                comment.$id
            );
            return res.json({ status: "Success: Spam deleted" });
        } catch (err) {
            error("Failed to delete comment: " + err.message);
            return res.json({ status: "Error", message: err.message }, 500);
        }
    }

    log("✅ Comment looks clean.");
    return res.json({ status: "Clean comment allowed" });
};
