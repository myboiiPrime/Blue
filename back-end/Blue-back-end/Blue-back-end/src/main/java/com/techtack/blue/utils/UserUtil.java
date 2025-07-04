package com.techtack.blue.utils;

import com.techtack.blue.model.User;

public class UserUtil {
    public static final boolean isReqUser(User reqUser, User user2) {
        return reqUser.getId().equals(user2.getId());
    }
}
