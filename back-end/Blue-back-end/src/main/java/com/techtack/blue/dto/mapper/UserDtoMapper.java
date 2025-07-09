package com.techtack.blue.dto.mapper;

import com.techtack.blue.dto.UserDto;
import com.techtack.blue.model.User;

import java.util.ArrayList;
import java.util.List;

public class UserDtoMapper {
    public static UserDto toUserDto(User user) {
        UserDto userDto=new UserDto();
        userDto.setEmail(user.getEmail());
        userDto.setUsername(user.getUsername());
        userDto.setIdentification_card(user.getIdentification_card());
        userDto.setLocation(user.getLocation());

        return userDto;
    }

    public static User toUser(UserDto userDto) {
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setUsername(userDto.getUsername());
        user.setIdentification_card(userDto.getIdentification_card());
        user.setLocation(userDto.getLocation());
        user.setPassword(userDto.getPassword());
        user.setMobile(userDto.getMobile());
        user.setAccountBalance(userDto.getAccountBalance());
        user.setReq_user(userDto.isReq_user());
        user.setVerified(userDto.isVerified());
        user.setVerificationStartTime(userDto.getVerificationStartTime());
        user.setVerificationEndTime(userDto.getVerificationEndTime());
        user.setToken(userDto.getToken());
        return user;
    }
}
