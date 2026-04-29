package com.ChatApp.Repository;

import com.ChatApp.Entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderMobile = :u1 AND m.receiverMobile = :u2) OR " +
           "(m.senderMobile = :u2 AND m.receiverMobile = :u1) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("u1") String u1, @Param("u2") String u2);

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.senderMobile = :u1 AND m.receiverMobile = :u2) OR " +
           "(m.senderMobile = :u2 AND m.receiverMobile = :u1) " +
           "ORDER BY m.timestamp DESC")
    List<ChatMessage> findLatestMessage(@Param("u1") String u1, @Param("u2") String u2, Pageable pageable);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE " +
    		"m.senderMobile = :sender AND m.receiverMobile = :receiver AND m.status != 'seen'")
    long countUnreadMessages(@Param("sender") String sender, @Param("receiver") String receiver);

    @Modifying
    @Transactional
    @Query("UPDATE ChatMessage m SET m.status = 'seen' WHERE " +
           "m.senderMobile = :sender AND m.receiverMobile = :receiver AND m.status != 'seen'")
    void markMessagesAsRead(@Param("sender") String sender, @Param("receiver") String receiver);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatMessage m WHERE " +
           "(m.senderMobile = :u1 AND m.receiverMobile = :u2) OR " +
           "(m.senderMobile = :u2 AND m.receiverMobile = :u1)")
    void deleteChatHistory(@Param("u1") String u1, @Param("u2") String u2);
}